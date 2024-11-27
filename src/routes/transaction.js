const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// Nạp tiền
router.post("/deposit", transactionController.deposit);

// Rút tiền
router.post("/withdraw", transactionController.withdraw);
router.post("/transfer", transactionController.transfer);

// Admin xử lý giao dịch
router.post("/process", transactionController.processTransaction);

module.exports = router;
