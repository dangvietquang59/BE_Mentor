"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ChatGroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});
ChatGroupSchema.index({
  members: 1
}, {
  unique: true
});
module.exports = mongoose.model("ChatGroup", ChatGroupSchema);