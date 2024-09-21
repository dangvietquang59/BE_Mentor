"use strict";

var express = require("express");
var multer = require("multer");
var messageController = require("../controllers/messageController");
var fs = require("fs");
var path = require("path");
var uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
var upload = multer({
  storage: storage
});
module.exports = function (io) {
  var router = express.Router();
  router.post("/", upload.array("attachments", 10), function (req, res) {
    return messageController.createMessage(req, res, io);
  });
  router.get("/group/:groupId", messageController.getMessagesByGroup);
  router.get("/:id", messageController.getMessageById);
  router.put("/:id", messageController.updateMessage);
  router["delete"]("/:id", messageController.deleteMessage);
  return router;
};