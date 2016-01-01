var express = require("express");
// var Firebase = require("firebase");
// var Queue = require("firebase-queue");
var FS = require("fs");
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
var Init = require("./helpers/init")(app);
Init.setBaseDir(__dirname);
Init.setImgBucket("upload/images");

var Image = new require("./helpers/image")(app)
  , paths = app.locals.paths
  , buckets = app.locals.buckets;

app.post("/" +paths.imgBucket +"/" +buckets.wip, (req, res, next) => {
  var file = req.files.file;
  
  Image.resize(file, res).then(() => {
    debugger;
    Async.parallel({
      cleanup: (cleanupCb) => {
         // 3. Cleanup original image from WIP bucket
        FS.unlink(file.path, (err) => {
          if (err)
            cleanupCb(err, null);
          else
            cleanupCb(null, "old file removed");
        });
      },
      upload: (uploadCb) => {
        // 4. Upload resized image to Image host provider
        uploadCb(null, "file uploaded")
      }
    }, (err, results) => {
      debugger;
    });
  });
  

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