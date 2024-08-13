"use strict";

var mongoose = require("mongoose");
var commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    require: true
  },
  parentCommentId: {
    type: String,
    "default": null
  },
  content: {
    type: String,
    require: true
  }
}, {
  timestamps: true
});
var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;