const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-users", userController.getAllUsers);
router.get(
  "/get-profile/:userId",
  authMiddleware.authenticateToken,
  userController.getProfile
);
router.post(
  "/update-profile/:userId",
  authMiddleware.authenticateToken,
  userController.updateProfile
);
module.exports = router;
