const Technologies = require("../models/Technologies");

async function getAll(req, res) {
  try {
    const technologies = await Technologies.find();
    return res.status(200).json(technologies);
  } catch (error) {
    console.log("Error fetching technologies", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the technologies." });
  }
}

module.exports = {
  getAll,
};
