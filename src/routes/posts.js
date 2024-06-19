const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");

//post
router.get("/get-all-post", postController.getAllPost);
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

//comments

router.get("/get-all-comment/:postId", postController.getAllComments);
router.post(
  "/create-new-comment/:postId",
  authMiddleware.authenticateToken,
  postController.createNewComment
);
router.put(
  "/update-comment/:commentId",
  authMiddleware.authenticateToken,
  postController.updateComment
);
router.delete(
  "/delete-comment/:commentId",
  authMiddleware.authenticateToken,
  postController.deleteComment
);
module.exports = router;
