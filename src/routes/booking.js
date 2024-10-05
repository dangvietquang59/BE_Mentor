const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");
// Đảm bảo bạn đã import đúng các hàm từ controller
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
router.get(
  "/user/:userId",
  authMiddleware.authenticateToken,
  bookingController.getBookingsByUserId
); // Kiểm tra dòng này
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
