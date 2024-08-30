const mongoose = require("mongoose");

const technologies = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Technologies = mongoose.model("Technologies", technologies);

module.exports = Technologies;
