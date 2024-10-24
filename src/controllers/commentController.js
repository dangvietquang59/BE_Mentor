const Comment = require("../models/Comment"); // Import Comment model
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Post = require("../models/Posts");
const User = require("../models/User");

async function createComment(req, res) {
  try {
    const { userId, postId, parent, content } = req.body;

    if (!userId || !postId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const authorId = post.userId;
    const newComment = new Comment({
      userId: new mongoose.Types.ObjectId(userId),
      postId: new mongoose.Types.ObjectId(postId),
      parent: parent ? new mongoose.Types.ObjectId(parent) : null,
      content,
    });

    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({ message: "Mentee not found" });
    }

    const newNotification = new Notification({
      user: authorId,
      sender: userId,
      content: `You have a new comment on your post from ${sender?.fullName}`,
      entityType: "Comment",
      entityId: postId,
    });

    // Save the comment and notification
    await Promise.all([newComment.save(), newNotification.save()]);

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

async function deleteChildrenComments(commentId) {
  // Tìm tất cả các comment con có parent là commentId
  const children = await Comment.find({ parent: commentId });

  // Duyệt qua từng comment con và xóa các comment con của nó (nếu có)
  for (const child of children) {
    await deleteChildrenComments(child._id); // Gọi đệ quy để xóa các comment con của nó
    await Comment.findByIdAndDelete(child._id); // Xóa chính comment con đó
  }
}

// Cập nhật hàm deleteComment
async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    // Tìm comment muốn xóa
    const commentToDelete = await Comment.findById(commentId);

    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Xóa tất cả các comment con đệ quy nếu có
    await deleteChildrenComments(commentId);

    // Xóa chính comment cha hoặc comment con
    await Comment.findByIdAndDelete(commentId);

    res
      .status(200)
      .json({ success: true, message: "Comment and related replies deleted" });
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
