"use strict";

var multer = require("multer");
var storage = multer.memoryStorage();
var singleUpload = multer({
  storage: storage
}).single("file");
module.exports = {
  singleUpload: singleUpload,
  multipleUpload: multipleUpload
};