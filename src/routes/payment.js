// routes/paymentRoute.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Route tạo link thanh toán VNPay
router.post("/create-payment", paymentController.createPayment);
router.get("/vnpay_return", paymentController.paymentResponse);
module.exports = router;
