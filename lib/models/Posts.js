"use strict";

var mongoose = require("mongoose");
var postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});
var Post = mongoose.model("Post", postSchema);
module.exports = Post;