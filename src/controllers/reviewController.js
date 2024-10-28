const Review = require("../models/Review");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

// Lấy tất cả các đánh giá
async function getAllReviews(req, res) {
  try {
    const reviews = await Review.find()
      .populate("user", "-password") // Không lấy trường password
      .populate("bookingId")
      .populate("technologies"); // Populate technologies field
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy đánh giá",
      error: error.message,
    });
  }
}

// Tạo một đánh giá mới
async function createReview(req, res) {
  const { user, bookingId, point, content, technologies } = req.body;

  // Validate required fields
  if (!user || !bookingId || !point || !content) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp đầy đủ thông tin." });
  }

  // Validate point (e.g., between 1 and 5)
  const pointNumber = parseInt(point);
  if (isNaN(pointNumber) || pointNumber < 1 || pointNumber > 5) {
    return res.status(400).json({ message: "Điểm phải là số từ 1 đến 5." });
  }

  const newReview = new Review({
    user,
    bookingId,
    point, // Include point in the new review
    content,
    technologies, // Include technologies if provided
  });

  try {
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo đánh giá",
      error: error.message,
    });
  }
}

// Xóa một đánh giá
async function deleteReview(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  try {
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đánh giá để xóa." });
    }
    res.status(200).json({ message: "Đánh giá đã được xóa" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa đánh giá",
      error: error.message,
    });
  }
}

// Cập nhật một đánh giá
async function updateReview(req, res) {
  const { id } = req.params;
  const { point, content, technologies } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  // Validate point if provided
  if (point) {
    const pointNumber = parseInt(point);
    if (isNaN(pointNumber) || pointNumber < 1 || pointNumber > 5) {
      return res.status(400).json({ message: "Điểm phải là số từ 1 đến 5." });
    }
  }

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { point, content, technologies },
      { new: true, runValidators: true } // Chạy các trình xác thực
    ).populate("technologies");

    if (!updatedReview) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đánh giá để cập nhật." });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật đánh giá",
      error: error.message,
    });
  }
}

// Lấy tất cả đánh giá theo userId
async function getByUserId(req, res) {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Chuyển đổi page và limit sang số
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  try {
    const bookings = await Booking.find({ participants: userId }).select("_id");
    const bookingIds = bookings.map((booking) => booking._id);

    const reviews = await Review.find({ bookingId: { $in: bookingIds } })
      .populate({ path: "user", select: "-password" })
      .populate("bookingId")
      .populate("technologies")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalReviews = await Review.countDocuments({
      bookingId: { $in: bookingIds },
    });

    return res.status(200).json({
      totalPages: Math.ceil(totalReviews / limitNumber),
      currentPage: pageNumber,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy đánh giá theo userId",
      error: error.message,
    });
  }
}

module.exports = {
  updateReview,
  deleteReview,
  createReview,
  getAllReviews,
  getByUserId,
};
