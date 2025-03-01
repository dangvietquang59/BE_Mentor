const mongoose = require("mongoose");

const adminRevenueSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminRevenue", adminRevenueSchema);
