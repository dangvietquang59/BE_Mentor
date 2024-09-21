const express = require("express");
const multer = require("multer");
const messageController = require("../controllers/messageController");

const upload = multer({ storage: multer.memoryStorage() });

module.exports = function (io) {
  const router = express.Router();

  router.post("/", upload.array("attachments", 10), (req, res) =>
    messageController.createMessage(req, res, io)
  );

  router.get("/group/:groupId", messageController.getMessagesByGroup);
  router.get("/:id", messageController.getMessageById);
  router.put("/:id", messageController.updateMessage);
  router.delete("/:id", messageController.deleteMessage);

  return router;
};
