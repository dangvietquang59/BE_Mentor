const Notification = require("../models/Notification");

// Create a Notification
const createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create notification", error: error.message });
  }
};

// Get All Notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("user sender");
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch notifications", error: error.message });
  }
};

// Get Notifications by User ID
const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ user: userId }).populate(
      "user sender"
    );

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch notifications for user",
        error: error.message,
      });
  }
};

// Get Notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate(
      "user sender"
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch notification", error: error.message });
  }
};

// Update Notification
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Run validators for updated data
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update notification", error: error.message });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(204).send(); // No content
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete notification", error: error.message });
  }
};

// Export all controller functions
module.exports = {
  createNotification,
  getAllNotifications,
  getNotificationsByUserId,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
