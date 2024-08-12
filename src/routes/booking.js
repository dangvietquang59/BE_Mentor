const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/create-new-booking",
  authMiddleware.authenticateToken,
  bookingController.bookTimeSlot
);
module.exports = router;
