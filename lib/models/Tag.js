"use strict";

var tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});
var Tag = mongoose.model("Tag", tagSchema);
module.exports = Tag;