const moment = require("moment-timezone");
const Message = require("../models/Message");
const ChatGroup = require("../models/ChatGroup");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary/index");

// Chuyển đổi ngày giờ về múi giờ Việt Nam
function toVietnamTime(date) {
  return moment(date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
}

// Tạo một tin nhắn mới
async function createMessage(req, res, io) {
  try {
    const { senderId, content, groupId } = req.body;

    const group = await ChatGroup.findById(groupId);
    const sender = await User.findById(senderId);

    // Kiểm tra xem nhóm và người gửi có tồn tại không
    if (!group || !sender) {
      return res.status(404).json({ error: "Group or sender not found" });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = await Promise.all(
        req.files.map(async (file) => {
          try {
            const result = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              stream.end(file.buffer);
            });
            return {
              filename: file.originalname,
              url: result.secure_url,
              mimetype: file.mimetype,
            };
          } catch (error) {
            console.error("Error uploading file:", error);
            return null; // Trả về null nếu có lỗi
          }
        })
      );

      // Lọc các tệp không thành công (null)
      attachments = attachments.filter(Boolean);
    }

    // Tạo tin nhắn mới
    const message = new Message({
      sender: sender._id,
      content: content || "",
      group: group._id,
      attachments,
      timestamp: toVietnamTime(new Date()),
    });

    await message.save();

    // Phát sự kiện mới qua Socket.IO
    io.to(groupId).emit("newMessage", { message });

    res
      .status(200)
      .json({ message: "Message sent successfully", data: message });
  } catch (error) {
    console.error("Error in createMessage:", error);
    res.status(500).json({ error: "Unable to send message" });
  }
}

// Lấy tất cả tin nhắn cho một nhóm cụ thể
async function getMessagesByGroup(req, res) {
  try {
    const messages = await Message.find({ group: req.params.groupId }).populate(
      "sender"
    );

    // Chuyển đổi timestamp sang giờ Việt Nam
    const messagesWithVietnamTime = messages.map((msg) => ({
      ...msg.toObject(),
      timestamp: toVietnamTime(msg.timestamp),
    }));

    res.status(200).json(messagesWithVietnamTime);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Unable to fetch messages" });
  }
}

// Lấy một tin nhắn cụ thể theo ID
async function getMessageById(req, res) {
  try {
    const message = await Message.findById(req.params.id).populate(
      "sender group"
    );
    if (!message) return res.status(404).json({ error: "Message not found" });

    const messageWithVietnamTime = {
      ...message.toObject(),
      timestamp: toVietnamTime(message.timestamp),
    };

    res.status(200).json(messageWithVietnamTime);
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Unable to fetch message" });
  }
}

// Cập nhật một tin nhắn theo ID
async function updateMessage(req, res) {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (req.body.timestamp) {
      message.timestamp = toVietnamTime(req.body.timestamp);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Unable to update message" });
  }
}

// Xóa một tin nhắn theo ID
async function deleteMessage(req, res) {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
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
