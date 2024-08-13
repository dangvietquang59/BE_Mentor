"use strict";

var mongoose = require("mongoose");
var bookingDetailsSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    require: true
  },
  from: {
    type: Date,
    require: true
  },
  to: {
    type: Date,
    require: true
  },
  status: {
    type: String,
    require: true,
    "default": "Pending"
  }
}, {
  timestamps: true
});
var BookingDetails = mongoose.model("BookingDetails", bookingDetailsSchema);
module.exports = BookingDetails;