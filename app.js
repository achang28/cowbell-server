'use strict'

require('dotenv').load();
var express = require("express");
var firebase = require("firebase");
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
  var reqBody = req.body;
  
  Image.resize(reqBody, file, res).then((fileInfo) => {
    /**
     * A inbound file is first referenced from a "wip" bucket, then it
     * is resized based pre-defined length for the longest side of the
     * img. During this process, the resized img is renamed and placed
     * in a "done" bucket. The resized img file is both uploaded to the
     * host img provider, and the filepath where the uploaded file is
     * placed is updated in the corresponding db record.
     */

    // 4A) Upload resized image to Image host provider
    var url = "https://" +process.env.DB +"-" +reqBody.env  +".firebaseIO.com";
    var db = new firebase(url);
    var hostFilepath = "issues/" +fileInfo.filename;
    var resData;

    var qUploadImg = Image.upload(file, fileInfo.dstPath, hostFilepath).then((successMsg) => {
      // 3. Cleanup original images from WIP and READY buckets
      Image.cleanup([fileInfo.srcPath, fileInfo.dstPath]);
      return successMsg;
    });

    // 4B) Update DB entry with hostFilepath
    var qUpdateDb = new Promise((resolve, reject) => {
      var imgRef = db.child("issues").child(reqBody.issueId +"/images/" +parseInt(reqBody.index));

      imgRef.update({uri: hostFilepath}, (err) => {
        if (err) reject("couldn't update DB");
        else resolve("Great! DB updated!");
      });
    });

    Promise.all([qUploadImg, qUpdateDb]).then((results) => {
      var msg = "1) Img uploaded to host && 2) Db record updated with host filepath";
      res.status(200).send(msg);
    }, (err) => {
      res.status(404).send(err);
    });
  }).catch((err) => {
    res.status(404).send(err);
  });
})

app.listen(port);