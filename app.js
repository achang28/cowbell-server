var express = require("express");
var Firebase = require("firebase");
var Queue = require("firebase-queue");
var Multipart = require('connect-multiparty');
var IM = require('imagemagick');

// Internal modules
var port = process.env.PORT || 3000;
var dbRef = new Firebase('https://cowbell-dev.firebaseio.com/queue');
var queue = new Queue(dbRef, function(data, progress, resolve, reject) {
  console.log("Queue Data: ", data);
  progress(50);
  resolve();
});

// initialize app and configure app
var app = express();
var dims = require("./helpers/dims")(app);

app.use('/assets', express.static(__dirname +'/public'));
app.use(Multipart({ uploadDir: "upload/images/wip" }));
app.post("/upload/images/wip", (req, res, next) => {
  // 1. begin resizing image
  var file = req.files.file
    , filepath = __dirname +"/" +file.path;

  IM.identify(filepath, (err, specs) => {
    if (err) {
      console.log(err);
      res.status(301).send(err);
    } else {
      var newDims = dims.adjustDims({ height: specs.height, width: specs.width })
        , destPath = __dirname +"/upload/images/done/" +file.name
        , args = {
          srcPath: filepath,
          dstPath: destPath,
          width: newDims.width
        };

      IM.resize(args, (err, stdout, stderr) => {
         // do stuff
         // obtain all img host credentials
        res.status(200).send("Great -- Img uploaded!");
      });
    }
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