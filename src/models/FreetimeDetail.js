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
    status: {
      type: String,
      enum: ["Availabe", "Pending", "Accepted"],
      default: "Availabe",
    },
    repeatDays: {
      type: [Number], // Mảng các ngày trong tuần cần lặp lại (0 = Chủ Nhật, 1 = Thứ Hai, ...)
      default: [], // Không lặp lại nếu không có giá trị
    },
  },
  { timestamps: true }
);

const FreeTimeDetail = mongoose.model("FreeTimeDetail", freeTimeDetailSchema);

module.exports = FreeTimeDetail;
