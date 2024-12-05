const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/user-count-by-role", adminController.getUserCountByRole);
router.get(
  "/transaction-count-by-status",
  adminController.getTransactionCountByStatus
);
router.get("/booking-count-by-status", adminController.getBookingCountByStatus);
router.get(
  "/top-mentors-by-hours",
  adminController.getTopMentorsByConsultationHours
);
router.get(
  "/transaction-count-by-type",
  adminController.getTransactionCountByType
);
router.get(
  "/transaction-amount-by-type",
  adminController.getTransactionAmountByType
);
router.get("/blocked-mentor-count", adminController.getBlockedMentorCount);
router.get("/confirmed-mentor-count", adminController.getConfirmedMentorCount);
router.get("/monthly-revenue", adminController.getMonthlyAdminRevenue);

module.exports = router;
