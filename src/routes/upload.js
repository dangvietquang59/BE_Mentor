const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const singleUpload = require("../middlewares/multer");

router.post("/upload", singleUpload, uploadController.uploadFile);

module.exports = router;
