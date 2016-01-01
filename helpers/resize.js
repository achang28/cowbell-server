var Dims = require("./dims");
var IM = require('imagemagick');
var _ = require("lodash");

var Resize = {
  img: function(file, app, res) {
    var filepath = __dirname +"/" +file.path;

    return new Promise((resolve, reject) => {
      IM.identify(filepath, (err, specs) => {
        if (err) {
          console.log(err);
          res.status(301).send(err);
          reject();
        } else {
          var paths = app.locals.paths
            , newDims = Dims.adjustDims(specs)
            , destPath = paths.base +paths.imgBucket +"/done/" +file.name
            , args = {
              srcPath: filepath,
              dstPath: destPath,
              width: newDims.width
            };

          IM.resize(args, (err, stdout, stderr) => {
             // obtain all img host credentials
            res.status(200).send("Great -- Img uploaded!");
            resolve(destPath);
            // need to cleanup WIP file
          });
        }
      });
    });
  }
}

module.exports = Resize;