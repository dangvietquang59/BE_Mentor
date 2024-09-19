const Post = require("../models/Posts");
const Comment = require("../models/Comments");
const slugify = require("slugify");
const moment = require("moment-timezone");

const timezone = "Asia/Ho_Chi_Minh"; // Múi giờ Việt Nam

// Helper function to get current time in Vietnamese timezone
function getCurrentTime() {
  return moment().tz(timezone).format();
}

async function getAllPost(req, res) {
  try {
    const allPosts = await Post.find();
    return res.status(200).json(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching posts" });
  }
}

async function createNewPost(req, res) {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;
    const slug = slugify(title, { lower: true });
    const createdAt = getCurrentTime();

    const newPost = new Post({
      title,
      content,
      userId,
      slug,
      createdAt,
    });

    const savedPost = await newPost.save();

    return res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the post" });
  }
}

async function getPostByUser(req, res) {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).lean();
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching posts" });
  }
}

async function updatePost(req, res) {
  const { postId } = req.params;
  const { title, content } = req.body;
  const slug = slugify(title, { lower: true });
  const updatedAt = getCurrentTime();

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content, slug, updatedAt },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.json({ message: "Post updated successfully.", data: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the post." });
  }
}

async function deletePost(req, res) {
  const { postId } = req.params;

  try {
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.json({ message: "Post deleted successfully.", data: deletedPost });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the post." });
  }
}

// Comments

async function getAllComments(req, res) {
  try {
    const { postId } = req.params;
    const allComments = await Comment.find({ postId });
    return res.status(200).json(allComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching comments" });
  }
}

async function createNewComment(req, res) {
  try {
    const { content, parentCommentId } = req.body;
    const { postId } = req.params;
    const userId = req.user.userId;
    const createdAt = getCurrentTime();

    const newComment = new Comment({
      userId,
      postId,
      content,
      parentCommentId,
      createdAt,
    });

    const savedComment = await newComment.save();

    return res.status(200).json(savedComment);
  } catch (error) {
    console.error("Error creating new comment:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating new comment" });
  }
}

async function updateComment(req, res) {
  const { commentId } = req.params;
  const { content } = req.body;
  const updatedAt = getCurrentTime();

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content, updatedAt },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    res.json({
      message: "Comment updated successfully.",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the comment." });
  }
}

async function deleteComment(req, res) {
  const { commentId } = req.params;

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    res.json({
      message: "Comment deleted successfully.",
      data: deletedComment,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the comment." });
  }
}

module.exports = {
  getAllPost,
  createNewPost,
  getPostByUser,
  updatePost,
  deletePost,
  getAllComments,
  createNewComment,
  updateComment,
  deleteComment,
};
