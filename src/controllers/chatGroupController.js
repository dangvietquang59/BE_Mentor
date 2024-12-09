const ChatGroup = require("../models/ChatGroup");

// Create new chat group
async function createChatGroup(req, res) {
  try {
    const { name, members } = req.body;

    members.sort();

    // Kiểm tra xem nhóm chat đã tồn tại chưa
    const existingGroup = await ChatGroup.findOne({
      members: { $all: members },
    });
    if (existingGroup) {
      return res
        .status(400)
        .json({ error: "Nhóm chat đã tồn tại", existingGroup });
    }

    // Tạo nhóm chat mới
    const savedGroup = new ChatGroup({ name, members });

    // Lưu nhóm chat mới và populate trường 'members' sau khi lưu
    const newGroup = await savedGroup.save();
    await newGroup.populate("members", "-password"); // Populate members và loại bỏ password

    // Trả về dữ liệu nhóm chat đã được populate
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: "Không thể tạo nhóm" });
  }
}

// Get all chat groups
async function getAllChatGroups(req, res) {
  try {
    const groups = await ChatGroup.find().populate("members");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch groups" });
  }
}

// Get a specific chat group by ID
async function getChatGroupById(req, res) {
  try {
    const group = await ChatGroup.findById(req.params.id).populate("members");
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch group" });
  }
}

// Update a chat group by ID
async function updateChatGroup(req, res) {
  try {
    const group = await ChatGroup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "Unable to update group" });
  }
}

// Delete a chat group by ID
async function deleteChatGroup(req, res) {
  try {
    const group = await ChatGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete group" });
  }
}
async function getChatGroupsByUserId(req, res) {
  try {
    const userId = req.params.userId;

    const findGroups = await ChatGroup.find({ members: userId }).populate(
      "members"
    );

    if (findGroups.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nhóm chat nào cho người dùng này" });
    }
    const groups = findGroups.map((group) => {
      const filteredMembers = group.members.filter(
        (member) => member._id.toString() !== userId
      );
      return {
        ...group.toObject(),
        members: filteredMembers,
      };
    });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: "Không thể lấy nhóm chat" + error });
  }
}
async function searchChatGroups(req, res) {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Missing or empty search query" });
    }

    // Tìm nhóm theo tên hoặc thành viên
    const groups = await ChatGroup.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Tìm theo tên nhóm
        {
          members: {
            $in: await User.find({
              fullName: { $regex: query, $options: "i" }, // Tìm theo tên thành viên
            }).distinct("_id"), // Lấy danh sách ObjectId của các thành viên
          },
        },
      ],
    })
      .populate({
        path: "members", // Populate thông tin thành viên
        select: "fullName email", // Lấy fullname và email
      })
      .lean();

    if (!groups || groups.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nhóm chat nào phù hợp" });
    }

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error searching chat groups:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Không thể tìm kiếm nhóm chat", details: error.message });
  }
}

module.exports = {
  createChatGroup,
  deleteChatGroup,
  updateChatGroup,
  getChatGroupById,
  getAllChatGroups,
  createChatGroup,
  getChatGroupsByUserId,
  searchChatGroups,
};
