"use strict";

var express = require("express");
var router = express.Router();
var freetimeController = require("../controllers/freetimeController");
var authMiddleware = require("../middlewares/authMiddleware");
router.post("/create-free-time", authMiddleware.authenticateToken, freetimeController.createFreeTime);
router.get("/get-free-time/:userId", authMiddleware.authenticateToken, freetimeController.getFreeTime);
router.put("/update-free-time/:freetimeId", authMiddleware.authenticateToken, freetimeController.updateFreeTime);
router["delete"]("/delete-free-time/:freetimeId", authMiddleware.authenticateToken, freetimeController.deleteFreeTime);
module.exports = router;