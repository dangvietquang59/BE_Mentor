"use strict";

var express = require("express");
var router = express.Router();
var uploadController = require("../controllers/uploadController");
var singleUpload = require("../middlewares/multer");
router.post("/upload", singleUpload, uploadController.uploadFile);
module.exports = router;