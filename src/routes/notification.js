const express = require("express");
const {
  createNotification,
  getAllNotifications,
  getNotificationsByUserId,
  getNotificationById,
  updateNotification,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

// Create a Notification
router.post("/", createNotification);

// Get All Notifications
router.get("/", getAllNotifications);

// Get Notifications by User ID
router.get("/user/:userId", getNotificationsByUserId);

// Get Notification by ID
router.get("/:id", getNotificationById);

// Update Notification
router.put("/:id", updateNotification);

// Delete Notification
router.delete("/:id", deleteNotification);

module.exports = router;
