var express = require("express");
// var Firebase = require("firebase");
// var Queue = require("firebase-queue");
var Multipart = require('connect-multiparty');
var IM = require('imagemagick');
var Async = require('async');
var _ = require("lodash");

// Internal modules
var port = process.env.PORT || 3000;
// var dbRef = new Firebase('https://cowbell-dev.firebaseio.com/queue');
// var queue = new Queue(dbRef, function(data, progress, resolve, reject) {
//   console.log("Queue Data: ", data);
//   progress(50);
//   resolve();
// });

// initialize app and configure app
var app = express();
var dims = require("./helpers/dims");
var Init = require("./helpers/init")(app);

Init.setBaseDir(__dirname);
Init.setImgBucket("upload/images");

var paths = app.locals.paths, wipBucket = "wip", doneBucket = "done";

app.use(Multipart({ uploadDir: paths.imgBucket +"/" +wipBucket }));
app.post("/" +paths.imgBucket +"/" +wipBucket, (req, res, next) => {
  var file = req.files.file, filepath = paths.base +"/" +file.path;

  // 1. Obtain metadata about original image
  var qImgResize = new Promise((resolve, reject) => {
    IM.identify(filepath, (err, specs) => {
      if (err) {
        console.log(err);
        res.status(404).send(err);
      } else {
        var newDims = dims.adjustDims(specs)
          , destPath = paths.base +"/" +paths.imgBucket +"/" +doneBucket +"/" +file.name;
        
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

  // qImgResize.then(() => {
  //   Async.parallel({
  //     cleanup: (cleanupCb) => {
  //        // 3. Cleanup original image from WIP bucket
  //     },
  //     upload: (uploadCb) => {
  //       // 4. Upload resized image to Image host provider
  //     }
  //   }, (err, results) => {

  //   });
  // })
  

  // var s3Obj = {
  //     uri: file.uri,
  //     uploadUrl: s3Data.url,
  //     mimeType: "image/" +file.ext,
  //     data: {
  //       'acl': 'public-read',
  //       'AWSAccessKeyId': s3Data.key,
  //       'Content-Type': "image/" +file.ext,
  //       'policy': s3Data.policy,
  //       'key': this._storeName +"/" +file.name,
  //       'signature': s3Data.signature,
  //     },
  //   };
})

app.listen(port);