const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatGroup",
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  attachments: [
    {
      filename: { type: String },
      path: { type: String },
      mimetype: { type: String },
    },
  ],
});

module.exports = mongoose.model("Message", MessageSchema);
