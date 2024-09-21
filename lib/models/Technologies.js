"use strict";

var mongoose = require("mongoose");
var technologies = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});
var Technologies = mongoose.model("Technologies", technologies);
module.exports = Technologies;