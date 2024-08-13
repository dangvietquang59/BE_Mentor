"use strict";

var mongoose = require("mongoose");
var freeTimeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  freeDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
var FreeTime = mongoose.model("FreeTime", freeTimeSchema);
module.exports = FreeTime;