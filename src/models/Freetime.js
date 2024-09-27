const mongoose = require("mongoose");

const freeTimeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freeDate: { type: Date, required: true },
    freeTimeDetail: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FreeTimeDetail",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const FreeTime = mongoose.model("FreeTime", freeTimeSchema);

module.exports = FreeTime;
