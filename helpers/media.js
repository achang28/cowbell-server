'use strict'
var ImgHostProvider = require("./s3Provider");

function Media(bucket, key, secret) {
  this.awsAccessKey = env.AWS_ACCESS_KEY;
  this.awsSecretKey = env.AWS_SECRET_KEY;
  this.s3Bucket = env.S3_BUCKET;
}

Media.prototype.upload = function(hostParams) {
  //var s3 = new aws.S3();
  // 1. build s3 policy first
  //uploadCb(null, "file uploaded")
}