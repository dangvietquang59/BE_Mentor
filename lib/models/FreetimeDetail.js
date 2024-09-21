"use strict";

var mongoose = require("mongoose");
var freeTimeDetailSchema = new mongoose.Schema({
  freeTimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FreeTime",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    "enum": ["Pending", "Accepted"],
    "default": "Pending"
  }
}, {
  timestamps: true
});
var FreeTimeDetail = mongoose.model("FreeTimeDetail", freeTimeDetailSchema);
module.exports = FreeTimeDetail;