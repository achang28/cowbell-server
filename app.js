var cloudinary = require('cloudinary');
var express = require("express");
var Firebase = require("firebase");
var Queue = require("firebase-queue");
// var multer = require("multer");
var multipart = require('connect-multiparty')
// var bodyParser = require("body-parser");

// var upload = multer();
var app = express();
var port = process.env.PORT || 3000;
var dbRef = new Firebase('https://cowbell-dev.firebaseio.com/queue');
var queue = new Queue(dbRef, function(data, progress, resolve, reject) {
  console.log("Queue Data: ", data);
  progress(50);
  resolve();
});

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static(__dirname +'/public'));
app.use(multipart({
  uploadDir: "upload/images"
}));

app.get('/', function(req, res) {
  console.log("PORT: ", process.env.PORT);
  res.send(
    '<html>'
    +'  <head>'
    +'    <title>Testing</title>'
    +'    <link href="assets/style.css" type="text/css" rel="stylesheet">Testing</title>'
    +'  </head>'
    +'  <body>Testing, 1...2...3</body>'
    +'</html>'
  );
});

app.get('/api', function(req, res) {
  res.send({ name: "Albert Chang", age: 32 });
});

app.get('/person/:id', function(req, res) {
  var people = [
    { name: "Albert Chang", age: 37},
    { name: "Jack Black", age: 42}
  ];
  
  var index = req.params["id"];
  res.json( people[index] || { name: "generic", age: 25 });
});

app.post("/upload/images", function(req, res, next) {
  var msg = "It worked, biyatch!";
  res.status(200).send(msg);

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