// routes/reviewRoutes.js

const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Lấy tất cả các đánh giá
router.get("/", reviewController.getAllReviews);

// Tạo một đánh giá mới
router.post("/", reviewController.createReview);

// Cập nhật một đánh giá
router.put("/:id", reviewController.updateReview);

// Xóa một đánh giá
router.delete("/:id", reviewController.deleteReview);

router.get("/user/:userId", reviewController.getByUserId);
module.exports = router;
