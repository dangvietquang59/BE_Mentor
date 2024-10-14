const Comment = require("../models/Comment"); // Import Comment model
const mongoose = require("mongoose");

async function createComment(req, res) {
  try {
    const { userId, postId, parent, content } = req.body;

    if (!userId || !postId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = new Comment({
      userId: new mongoose.Types.ObjectId(userId),
      postId: new mongoose.Types.ObjectId(postId),
      parent: parent ? new mongoose.Types.ObjectId(parent) : null,
      content,
    });

    await newComment.save();
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getCommentsByPostId(req, res) {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId }).populate({
      path: "userId",
      select: "fullName email role imageUrl coin technologies",
      populate: {
        path: "bio",
        model: "Job",
      },
    });

    const rootComments = comments.filter((comment) => !comment.parent);

    const groupedComments = rootComments.map((rootComment) => {
      const childComments = comments.filter(
        (comment) =>
          comment.parent &&
          comment.parent.toString() === rootComment._id.toString()
      );
      return { ...rootComment.toObject(), children: childComments };
    });

    const totalComments = comments.length;

    res.status(200).json({
      success: true,
      comments: groupedComments,
      totalComments: totalComments,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updateComment(req, res) {
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
}

async function deleteComment(req, res) {
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
}
module.exports = {
  deleteComment,
  updateComment,
  createComment,
  getCommentsByPostId,
};
