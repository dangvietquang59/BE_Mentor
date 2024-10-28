const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    point: { type: String, required: true },
    content: {
      type: String,
      required: true,
    },
    technologies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technologies",
      },
    ],
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
