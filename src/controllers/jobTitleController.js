// /controllers/job.controller.js
const Job = require("../models/JobTitle");

// Lấy tất cả các công việc
const getJobs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Mặc định là page 1 và limit 10

  try {
    // Tính toán số lượng công việc cần bỏ qua (skip)
    const jobs = await Job.find()
      .limit(parseInt(limit)) // Giới hạn số lượng công việc trả về
      .skip((parseInt(page) - 1) * parseInt(limit)); // Bỏ qua các công việc của các trang trước

    // Tổng số lượng công việc để tính toán số trang
    const totalJobs = await Job.countDocuments();
    const totalPages = Math.ceil(totalJobs / limit);

    res.status(200).json({
      totalJobs,
      totalPages,
      currentPage: parseInt(page),
      jobs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo công việc mới
const createJob = async (req, res) => {
  const { name } = req.body;
  const job = new Job({ name });

  try {
    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy công việc theo ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job == null) {
      return res.status(404).json({ message: "Cannot find job" });
    }
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật công việc
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job == null) {
      return res.status(404).json({ message: "Cannot find job" });
    }

    if (req.body.name != null) {
      job.name = req.body.name;
    }

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa công việc
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job == null) {
      return res.status(404).json({ message: "Cannot find job" });
    }

    await job.remove();
    res.status(200).json({ message: "Deleted Job" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  deleteJob,
  updateJob,
  getJobById,
  createJob,
  getJobs,
};
