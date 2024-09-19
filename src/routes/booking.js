const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/",
  authMiddleware.authenticateToken,
  bookingController.createBooking
);
router.get(
  "/",
  authMiddleware.authenticateToken,
  bookingController.getAllBookings
);
router.get(
  "/:id",
  authMiddleware.authenticateToken,
  bookingController.getBookingById
);
router.put(
  "/:id",
  authMiddleware.authenticateToken,
  bookingController.updateBooking
);
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  bookingController.deleteBooking
);

module.exports = router;
