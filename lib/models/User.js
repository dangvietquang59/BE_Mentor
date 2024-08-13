"use strict";

var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String
  },
  role: {
    type: String
  },
  bio: {
    type: String
  },
  imageUrl: {
    type: String
  },
  experience: {
    type: String
  },
  rating: {
    type: String
  },
  slug: {
    type: String
  }
}, {
  timestamps: true
});
var User = mongoose.model("User", userSchema);
module.exports = User;