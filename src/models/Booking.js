const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    freetimeDetailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FreeTimeDetail",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Accepted", "Canceled"],
      default: "Pending",
    },
    amount: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
