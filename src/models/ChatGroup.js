const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatGroupSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  latestMessage: {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
});

module.exports = mongoose.model("ChatGroup", ChatGroupSchema);
