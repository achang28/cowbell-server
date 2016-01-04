'use strict'
var aws = require("aws-sdk");
  //header("Access-Control-Allow-Credentials: true");
  //header("Access-Control-Allow-Origin: http://localhost");
  //header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
  //header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

function s3Provider(bucketName, accessKey, secretKey) {
  this.bucketName = bucketName;
  this.accessKey = accessKey;
  this.secretKey = secretKey;

  aws.config.region = 'us-west-2'
  aws.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  });

  this.s3 = new aws.S3();
}

s3Provider.prototype.getSignedPolicy = function(s3Params) {
  this.s3.getSignedUrl('putObject', s3Params, function(err, data){
    if(err){
      console.log(err);
    }
    else{
      var return_data = {
        signed_request: data,
        url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
      };
      res.write(JSON.stringify(return_data));
      res.end();
    }
  });
}

module.exports = s3Provider;