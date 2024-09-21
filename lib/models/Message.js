"use strict";

var mongoose = require("mongoose");
var messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatGroup",
    required: true
  },
  attachments: [{
    filename: {
      type: String
    },
    path: {
      type: String
    },
    mimetype: {
      type: String
    }
  }],
  timestamp: {
    type: String,
    "default": function _default() {
      return moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
    }
  }
}, {
  timestamps: true
});
var Message = mongoose.model("Message", messageSchema);
module.exports = Message;