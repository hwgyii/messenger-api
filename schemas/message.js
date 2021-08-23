const mongoose = require('mongoose');

const MESSAGE_MODEL = new mongoose.Schema({
  messagedBy: { type: mongoose.ObjectId, ref: "User" },
  message: { type: String },
  groupId: { type: mongoose.ObjectId, ref: "Group" },
}, { timestamps: true, versionKey: false});

module.exports = mongoose.model("Message", MESSAGE_MODEL);