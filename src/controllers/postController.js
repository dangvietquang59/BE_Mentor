const Post = require("../models/Posts");
const slugify = require("slugify");
const moment = require("moment-timezone");

const timezone = "Asia/Ho_Chi_Minh"; // Múi giờ Việt Nam

// Helper function to get current time in Vietnamese timezone
function getCurrentTime() {
  return moment().tz(timezone).format();
}

async function getAllPost(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    // Build the query object for filtering
    const query = search
      ? { title: { $regex: search, $options: "i" } } // Search case-insensitively in title
      : {};

    const allPosts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("userId")
      .populate("tags");

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limitNumber);

    return res.status(200).json({
      totalPosts,
      totalPages,
      currentPage: pageNumber,
      posts: allPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching posts" });
  }
}

async function createNewPost(req, res) {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.userId;
    const slug = slugify(title, { lower: true });
    const createdAt = getCurrentTime();

    const newPost = new Post({
      title,
      content,
      userId,
      tags,
      slug: `${slug}-${userId}`,
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
async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug }).populate("userId");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the post" });
  }
}

module.exports = {
  getAllPost,
  createNewPost,
  getPostByUser,
  updatePost,
  deletePost,
  getPostBySlug,
};
