const mongoose = require('mongoose');

const GROUP_MODEL = new mongoose.Schema({
  adminId: { type: String },
  name: { type: String, required: true, unique: true},
  password: { type: String },
  currentUsers: [ { type: mongoose.ObjectId, ref: "User" } ],
  messages: [ { type: mongoose.ObjectId, ref: "Mesage" } ],
  displayPicture: {type: String },
}, { versionKey: false });

module.exports = mongoose.model("Group", GROUP_MODEL);