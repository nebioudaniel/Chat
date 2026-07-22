const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/:threadId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ threadId: req.params.threadId })
      .sort({ timestamp: 1 })
      .limit(200);
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
