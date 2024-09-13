const express = require("express");
const multer = require("multer");
const router = express.Router();
const messageController = require("../controllers/messageController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/",
  upload.array("attachments", 10),
  messageController.createMessage
);
router.get("/group/:groupId", messageController.getMessagesByGroup);
router.get("/:id", messageController.getMessageById);
router.put("/:id", messageController.updateMessage);
router.delete("/:id", messageController.deleteMessage);

module.exports = router;
