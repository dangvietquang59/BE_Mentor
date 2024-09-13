const ChatGroup = require("../models/ChatGroup");

// Create new chat group
async function createChatGroup(req, res) {
  try {
    const { name, members } = req.body;
    const newGroup = new ChatGroup({ name, members });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: "Unable to create group" });
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

module.exports = {
  createChatGroup,
  deleteChatGroup,
  updateChatGroup,
  getChatGroupById,
  getAllChatGroups,
  createChatGroup,
};
