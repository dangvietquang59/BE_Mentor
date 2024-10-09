const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");

//post
router.get("/get-all-post", postController.getAllPost);
router.get("/get-post-by-slug/:slug", postController.getPostBySlug);
router.get(
  "/get-post-by-user/:userId",
  authMiddleware.authenticateToken,
  postController.getPostByUser
);
router.post(
  "/create-new-post",
  authMiddleware.authenticateToken,
  postController.createNewPost
);
router.put(
  "/update-post/:postId",
  authMiddleware.authenticateToken,
  postController.updatePost
);
router.delete(
  "/delete-post/:postId",
  authMiddleware.authenticateToken,
  postController.deletePost
);

module.exports = router;
