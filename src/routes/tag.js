const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");

// Create a new tag
router.post("/", tagController.createTag);

// Get all tags (with pagination)
router.get("/", tagController.getTags);

// Get a tag by slug
router.get("/:slug", tagController.getTagBySlug);

// Update a tag by id
router.put("/:id", tagController.updateTag);

// Delete a tag by id
router.delete("/:id", tagController.deleteTag);

module.exports = router;
