"use strict";

var express = require("express");
var router = express.Router();
var bookingController = require("../controllers/bookingController");
var authMiddleware = require("../middlewares/authMiddleware");
router.post("/create-new-booking", authMiddleware.authenticateToken, bookingController.bookTimeSlot);
module.exports = router;