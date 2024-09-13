const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatGroupSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("ChatGroup", ChatGroupSchema);
