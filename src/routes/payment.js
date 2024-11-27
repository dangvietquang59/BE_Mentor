// routes/paymentRoute.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route tạo link thanh toán VNPay
router.post(
  "/create-payment",
  authMiddleware.authenticateToken,
  paymentController.createPayment
);
router.get("/vnpay_return", paymentController.paymentResponse);
module.exports = router;
