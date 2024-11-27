const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-users", userController.getAllUsers);
router.get("/get-profile/:userId", userController.getProfile);
router.get("/user/:userId", userController.getProfile);
router.put(
  "/update-profile/:userId",
  authMiddleware.authenticateToken,
  userController.updateProfile
);
router.put(
  "/update-profile-image/:userId",
  authMiddleware.authenticateToken,
  userController.updateProfileImageUrl
);
router.put(
  "/update-rating/:userId",
  authMiddleware.authenticateToken,
  userController.updateRating
);
router.get("/me", authMiddleware.authenticateToken, userController.getMe);
module.exports = router;
