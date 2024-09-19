const moment = require("moment-timezone");
const Message = require("../models/Message");
const ChatGroup = require("../models/ChatGroup");
const User = require("../models/User");

// Convert a date to Vietnam timezone
function toVietnamTime(date) {
  return moment(date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
}

// Create a new message
async function createMessage(req, res, io) {
  try {
    const { senderId, content, groupId } = req.body;
    const group = await ChatGroup.findById(groupId);
    const sender = await User.findById(senderId);

    if (!group || !sender) {
      return res.status(404).json({ error: "Group or sender not found" });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
      }));
    }

    const message = new Message({
      sender: sender._id,
      content,
      group: group._id,
      attachments,
      timestamp: toVietnamTime(new Date()), // Set timestamp in Vietnam time
    });

    await message.save();

    io.to(groupId).emit("newMessage", { message });

    res
      .status(200)
      .json({ message: "Message sent successfully", data: message });
  } catch (error) {
    res.status(500).json({ error: "Unable to send message" });
  }
}

// Get all messages for a specific group
async function getMessagesByGroup(req, res) {
  try {
    const messages = await Message.find({ group: req.params.groupId }).populate(
      "sender"
    );

    // Convert timestamps to Vietnam time
    const messagesWithVietnamTime = messages.map((msg) => ({
      ...msg.toObject(),
      timestamp: toVietnamTime(msg.timestamp),
    }));

    res.status(200).json(messagesWithVietnamTime);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch messages" });
  }
}

// Get a specific message by ID
async function getMessageById(req, res) {
  try {
    const message = await Message.findById(req.params.id).populate(
      "sender group"
    );
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Convert timestamp to Vietnam time
    const messageWithVietnamTime = {
      ...message.toObject(),
      timestamp: toVietnamTime(message.timestamp),
    };

    res.status(200).json(messageWithVietnamTime);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch message" });
  }
}

// Update a message by ID
async function updateMessage(req, res) {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Convert timestamp to Vietnam time if it's updated
    if (req.body.timestamp) {
      message.timestamp = toVietnamTime(req.body.timestamp);
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: "Unable to update message" });
  }
}

// Delete a message by ID
async function deleteMessage(req, res) {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete message" });
  }
}

module.exports = {
  createMessage,
  deleteMessage,
  updateMessage,
  getMessageById,
  getMessagesByGroup,
};
