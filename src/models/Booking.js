const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    freetimeDetailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FreeTimeDetail",
      require: true,
    },
    status: {
      type: String,
      require: true,
      enum: ["Pending", "Accepted", "Refused"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
