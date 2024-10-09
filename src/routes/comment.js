const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");
// Create a new comment
router.post(
  "/",
  authMiddleware.authenticateToken,
  commentController.createComment
);

// Get all comments for a specific post
router.get("/post/:postId", commentController.getCommentsByPostId);

// Update a comment
router.put(
  "/:commentId",
  authMiddleware.authenticateToken,
  commentController.updateComment
);

// Delete a comment
router.delete(
  "/:commentId",
  authMiddleware.authenticateToken,
  commentController.deleteComment
);

module.exports = router;
