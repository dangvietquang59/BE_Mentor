const Technologies = require("../models/Technologies");

// Get all technologies with pagination
async function getAll(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Create search query object
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } } // 'i' để tìm kiếm không phân biệt chữ hoa chữ thường
      : {};

    // Fetch technologies with search and pagination
    const technologies = await Technologies.find(searchQuery)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    // Get total number of items after filtering by search
    const totalItems = await Technologies.countDocuments(searchQuery);

    return res.status(200).json({
      totalItems,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalItems / limitNumber),
      technologies,
    });
  } catch (error) {
    console.error("Error fetching technologies:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the technologies." });
  }
}

// Create a new technology
async function create(req, res) {
  try {
    const { name } = req.body;

    // Check if the technology already exists
    const existingTechnology = await Technologies.findOne({ name });
    if (existingTechnology) {
      return res.status(400).json({ error: "Technology already exists." });
    }

    const technology = new Technologies({ name });
    await technology.save();

    return res.status(201).json(technology);
  } catch (error) {
    console.error("Error creating technology:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the technology." });
  }
}

// Update an existing technology
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const technology = await Technologies.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!technology) {
      return res.status(404).json({ error: "Technology not found." });
    }

    return res.status(200).json(technology);
  } catch (error) {
    console.error("Error updating technology:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the technology." });
  }
}

// Delete a technology
async function remove(req, res) {
  try {
    const { id } = req.params;

    const technology = await Technologies.findByIdAndDelete(id);

    if (!technology) {
      return res.status(404).json({ error: "Technology not found." });
    }

    return res
      .status(200)
      .json({ message: "Technology deleted successfully." });
  } catch (error) {
    console.error("Error deleting technology:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the technology." });
  }
}

module.exports = {
  getAll,
  create,
  update,
  remove,
};
