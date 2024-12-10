const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/users", adminController.getUserCountByRole);
router.get("/revenue", adminController.getAdminRevenue);
router.get("/bookings", adminController.getBooking);
router.get("/transactions", adminController.getTransactions);
router.get("/revenue-by-range-day", adminController.getRevenueAndTransactions);

module.exports = router;
