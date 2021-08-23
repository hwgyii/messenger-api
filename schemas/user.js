const mongoose = require('mongoose');

const USER_MODEL = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  authToken: { type: String, select: false },
  groupsJoined: [{ type: mongoose.ObjectId, ref: "Group" }],
  displayPicture: { type: String },
}, { versionKey: false });

module.exports = mongoose.model("User", USER_MODEL);