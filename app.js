'use strict'

var express = require("express");
// var Firebase = require("firebase");
// var Queue = require("firebase-queue");
var async = require('async');
var body_parser = require('body-parser');
var express = require("express");
var http = require('http');
var path = require('path');
var port = process.env.PORT || 3000;
var _ = require("lodash");
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
  
  Image.resize(file, res).then((fileInfo) => {
    // 4. Upload resized image to Image host provider
    var hostFilepath = "issues/" +fileInfo.filename;
    var resData;

    Image.upload(file, fileInfo.dstPath, hostFilepath).then((successMsg) => {
      // 3. Cleanup original images from WIP and READY buckets
      Image.cleanup([fileInfo.srcPath, fileInfo.dstPath]);
      resData = { code: 200, msg: successMsg };
    }).catch((err) => {
      resData = { code: 404, msg: err };
    }).finally(() => {
      res.status(resData.code).send(resData.msg);
    });
  }).catch((err) => {
    res.status(404).send(err);
  });
})

app.listen(port);