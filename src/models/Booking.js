const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    freetimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FreeTime",
      require: true,
    },
    startDate: { type: String, require: true },
    startTime: { type: String, require: true },
    status: { type: String, require: true, default: "Pending" },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
