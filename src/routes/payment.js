// routes/paymentRoute.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Route tạo link thanh toán VNPay
router.post("/create-payment", paymentController.createPayment);

module.exports = router;
