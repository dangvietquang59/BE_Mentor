// models/FreeTime.js

const mongoose = require("mongoose");

const freeTimeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

const FreeTime = mongoose.model("FreeTime", freeTimeSchema);

module.exports = FreeTime;
