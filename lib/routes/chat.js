"use strict";

var express = require("express");
var router = express.Router();
var chatGroupController = require("../controllers/chatGroupController");
router.post("/", chatGroupController.createChatGroup);
router.get("/", chatGroupController.getAllChatGroups);
router.get("/:id", chatGroupController.getChatGroupById);
router.put("/:id", chatGroupController.updateChatGroup);
router["delete"]("/:id", chatGroupController.deleteChatGroup);
router.get("/user/:userId", chatGroupController.getChatGroupsByUserId);
module.exports = router;