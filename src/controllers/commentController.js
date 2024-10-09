const Comment = require("../models/commentModel"); // Import Comment model
const mongoose = require("mongoose");

exports.createComment = async (req, res) => {
  try {
    const { userId, postId, parent, content } = req.body;

    if (!userId || !postId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = new Comment({
      userId: mongoose.Types.ObjectId(userId),
      postId: mongoose.Types.ObjectId(postId),
      parent: parent ? mongoose.Types.ObjectId(parent) : null,
      content,
    });

    await newComment.save();
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "name")
      .populate("parent", "content");

    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ success: true, comment: updatedComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
