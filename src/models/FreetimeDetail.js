const mongoose = require("mongoose");

const freeTimeDetailSchema = new mongoose.Schema(
  {
    freeTimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FreeTime",
      required: true,
    },
    name: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    status: { type: String, enum: ["Pending", "Accepted"], default: "Pending" },
  },
  { timestamps: true }
);

const FreeTimeDetail = mongoose.model("FreeTimeDetail", freeTimeDetailSchema);

module.exports = FreeTimeDetail;
