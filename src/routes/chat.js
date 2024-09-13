const express = require("express");
const router = express.Router();
const chatGroupController = require("../controllers/chatGroupController");

router.post("/", chatGroupController.createChatGroup);
router.get("/", chatGroupController.getAllChatGroups);
router.get("/:id", chatGroupController.getChatGroupById);
router.put("/:id", chatGroupController.updateChatGroup);
router.delete("/:id", chatGroupController.deleteChatGroup);

module.exports = router;
