'use strict'

require('dotenv').load();
var fs = require("fs");
var s3fs = require("s3fs");
var IM = require('imagemagick');
var Multiparty = require('connect-multiparty');
var _ = require("lodash");
var Dims = require("./dims");
var Defer = require("promise-defer");
//var s3Provider = require("./s3Provider");

function image(app) {
  var _paths = app.locals.paths
    , _buckets = app.locals.buckets = { wip: "wip", done: "ready" };

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
      filename: filename,
      width: newDims.width
    };
  };

  return {
    cleanup: function(filepaths) {
      filepaths.forEach((filepath) =>
        fs.unlink(filepath, (err) => {
          if (err) console.log("couldn't remove file =(");
          else console.log("old file removed =)");
        })
      );
    },

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
          else qResize.resolve(args);
        });
      }).catch((err) => qResize.reject(err));

      return qResize.promise;
    },

    upload: function(file, sourceFilepath, destFilepath, callback) {
      //var s3 = new s3Provider(env.S3_BUCKET, env.AWS_ACCESS_KEY, env.AWS_SECRET_KEY);
      var env = process.env;
      var fileStream = fs.createReadStream(sourceFilepath);
      var s3 = new s3fs(env.S3_BUCKET, {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_KEY,
        region: "us-west-1"
      });

      return s3.writeFile(destFilepath, fileStream);
    }
  }
}

module.exports = image;