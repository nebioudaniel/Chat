const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  threadId: { type: String, required: true, index: true },
  sender: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
