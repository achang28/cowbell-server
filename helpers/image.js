'use strict'

require('dotenv').load();
var aws = require("aws-sdk");
var fs = require("fs");
var IM = require('imagemagick');
var Multiparty = require('connect-multiparty');
var _ = require("lodash");
var Dims = require("./dims");
var Defer = require("promise-defer");
//var s3Provider = require("./s3Provider");

function image(app) {
  var _paths = app.locals.paths
    , _buckets = app.locals.buckets = { wip: "wip", done: "done" };

  app.use(Multiparty({ uploadDir: _paths.imgBucket +"/" +_buckets.wip }));

  function _getFilename(file) {
    //return file.name;
    var filepath = file.path;
    return filepath.substr( filepath.lastIndexOf("/") + 1, filepath.lastIndex );
  }

  function _buildFilepath(args) {
    var filepath = _.reduce(args, (result, param) => {
      return result +"/" +param;
    });

    return filepath;
  }

  function _buildResizeArgs(fileSpecs, file, wipFilepath) {
    var newDims = Dims.adjustDims(fileSpecs);
    var filename = _getFilename(file);
    var filepathArgs = [_paths.base, _paths.imgBucket, _buckets.done, filename];

    return {
      srcPath: wipFilepath,
      dstPath: _buildFilepath(filepathArgs),
      width: newDims.width
    };
  };

  return {
    resize: function(file, res) {
      var filepathArgs = [_paths.base, file.path];
      var wipFilepath = _buildFilepath(filepathArgs);
      var qWipFile = Defer(), qResize = Defer();

      IM.identify(wipFilepath, (err, specs) => {
        if (err) qWipFile.reject("Can't get file specs: " +err);
        else qWipFile.resolve(specs);
      });

      qWipFile.promise.then((specs) => {
        var args = _buildResizeArgs(specs, file, wipFilepath);

        // 2. Resize original image and route to "done" bucket
        IM.resize(args, (err, stdout, stderr) => {
          // obtain all img host credentials
          if (stderr) qResize.reject("Can't resize file: " +stderr);
          else qResize.resolve(args.dstPath);
        });
      }).catch((err) => qResize.reject(err));

      return qResize.promise;
    },

    upload: function(file, hostFilepath, filepath, callback) {
      //var s3 = new s3Provider(env.S3_BUCKET, env.AWS_ACCESS_KEY, env.AWS_SECRET_KEY);
      var env = process.env
        , fileBuffer = fs.readFileSync(filepath);

      aws.config.update({
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_KEY,
        region: "us-west-2"
      });

      var s3 = new aws.S3();
      var s3Params = {
        Bucket: env.S3_BUCKET,
        Key: hostFilepath,
        Expires: 60,
        ContentType: file.headers["content-type"],
        ACL: 'public-read'
      };

      //var qSignedUrl = new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', s3Params, (err, urlSignature) => {
        if(err)
          callback("Problem with upload", null);
        else {
          var options = _.assign(s3Params, {
            Body: fileBuffer,
            Signature: urlSignature
          });

          s3.putObject(options, (err, res) => {
            if (err)
              callback("Problem with upload", null);
            else
              callback(null, "file uploaded")
          });

          //var returnData = {
          //  signed_request: data,
          //  url: data.substr(0, data.indexOf("?"))
          //};
        }
      });
    }
  }
}

module.exports = image;