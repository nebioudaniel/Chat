const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  userId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  groups: [String],
  dmPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", userSchema);
