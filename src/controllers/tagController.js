const Tag = require("../models/Tags");

// Create a new Tag
exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const newTag = new Tag({
      name,
      slug,
      description,
    });

    await newTag.save();
    return res
      .status(201)
      .json({ message: "Tag created successfully", tag: newTag });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the tag." });
  }
};

// Get all tags with pagination
exports.getTags = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query; // Destructure search from query parameters
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    // Create a filter object that can include a search condition
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const tags = await Tag.find(filter) // Apply the filter to the find query
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    const totalTags = await Tag.countDocuments(filter); // Apply the filter to the count query
    const totalPages = Math.ceil(totalTags / limitNumber);

    return res.status(200).json({
      totalTags,
      totalPages,
      currentPage: pageNumber,
      tags,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching tags." });
  }
};

// Get a single tag by slug
exports.getTagBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const tag = await Tag.findOne({ slug });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found." });
    }

    return res.status(200).json(tag);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the tag." });
  }
};

// Update a tag by id
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { name, slug, description },
      { new: true }
    );

    if (!updatedTag) {
      return res.status(404).json({ error: "Tag not found." });
    }

    return res
      .status(200)
      .json({ message: "Tag updated successfully", tag: updatedTag });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the tag." });
  }
};

// Delete a tag by id
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTag = await Tag.findByIdAndDelete(id);

    if (!deletedTag) {
      return res.status(404).json({ error: "Tag not found." });
    }

    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the tag." });
  }
};
