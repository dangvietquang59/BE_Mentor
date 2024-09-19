const FreeTimeDetail = require("../models/FreetimeDetail");

// Lấy danh sách FreeTimeDetail
const getFreeTimeDetails = async (req, res) => {
  try {
    const freeTimeDetails = await FreeTimeDetail.find();
    res.status(200).json(freeTimeDetails);
  } catch (error) {
    console.error("Error fetching free time details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching free time details." });
  }
};

// Lấy một FreeTimeDetail theo ID
const getFreeTimeDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const freeTimeDetail = await FreeTimeDetail.findById(id);
    if (!freeTimeDetail) {
      return res.status(404).json({ error: "FreeTimeDetail not found" });
    }
    res.status(200).json(freeTimeDetail);
  } catch (error) {
    console.error("Error fetching free time detail:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching free time detail." });
  }
};

// Tạo mới FreeTimeDetail
const createFreeTimeDetail = async (req, res) => {
  try {
    const { freeTimeId, name, from, to, status } = req.body;

    const newFreeTimeDetail = new FreeTimeDetail({
      freeTimeId,
      name,
      from,
      to,
      status,
    });

    await newFreeTimeDetail.save();
    res.status(201).json(newFreeTimeDetail);
  } catch (error) {
    console.error("Error creating free time detail:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating free time detail." });
  }
};

// Cập nhật FreeTimeDetail theo ID
const updateFreeTimeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, from, to, status } = req.body;

    const updatedFreeTimeDetail = await FreeTimeDetail.findByIdAndUpdate(
      id,
      { name, from, to, status },
      { new: true }
    );

    if (!updatedFreeTimeDetail) {
      return res.status(404).json({ error: "FreeTimeDetail not found" });
    }

    res.status(200).json(updatedFreeTimeDetail);
  } catch (error) {
    console.error("Error updating free time detail:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating free time detail." });
  }
};

// Xóa FreeTimeDetail theo ID
const deleteFreeTimeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFreeTimeDetail = await FreeTimeDetail.findByIdAndDelete(id);

    if (!deletedFreeTimeDetail) {
      return res.status(404).json({ error: "FreeTimeDetail not found" });
    }

    res.status(200).json({ message: "FreeTimeDetail deleted successfully" });
  } catch (error) {
    console.error("Error deleting free time detail:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting free time detail." });
  }
};

module.exports = {
  getFreeTimeDetails,
  getFreeTimeDetailById,
  createFreeTimeDetail,
  updateFreeTimeDetail,
  deleteFreeTimeDetail,
};
