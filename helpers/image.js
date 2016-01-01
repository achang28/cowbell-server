'use strict'

var IM = require('imagemagick');
var Multipart = require('connect-multiparty');
var _ = require("lodash");
var Dims = require("./dims");

function image(app) {
  var _paths = app.locals.paths
    , _buckets = app.locals.buckets = { wip: "wip", done: "done" };
  
  app.use(Multipart({ uploadDir: _paths.imgBucket +"/" +_buckets.wip }));

  return {
    resize: function(file, res) {
      var filepath = _paths.base +"/" +file.path;
      
      return new Promise((resolve, reject) => {
        IM.identify(filepath, (err, specs) => {
          if (err) {
            console.log(err);
            res.status(404).send(err);
          } else {
            var newDims = Dims.adjustDims(specs);
            var destPath = _paths.base +"/" +_paths.imgBucket +"/" +_buckets.done +"/" +file.name;
            var args = {
                srcPath: filepath,
                dstPath: destPath,
                width: newDims.width
              };

            // 2. Resize original image and route to done bucket
            IM.resize(args, (err, stdout, stderr) => {
               // obtain all img host credentials
              if ( _.isEmpty(stderr) )
                res.status(200).send("Great -- Img uploaded!");
              else
                res.status(404).send(stderr);
              
              resolve();
            });
          }
        });
      })
    }
  }
}

module.exports = image;