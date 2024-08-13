"use strict";

var mongoose = require("mongoose");
var refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    "default": Date.now,
    expires: "30d"
  }
});
var RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
module.exports = RefreshToken;