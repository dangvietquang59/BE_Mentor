"use strict";

var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController");
var authMiddleware = require("../middlewares/authMiddleware");
router.get("/get-all-users", userController.getAllUsers);
router.get(
  "/get-profile/:userId",
  authMiddleware.authenticateToken,
  userController.getProfile
);
router.post(
  "/update-profile/:userId",
  authMiddleware.authenticateToken,
  userController.updateProfile
);
module.exports = router;
