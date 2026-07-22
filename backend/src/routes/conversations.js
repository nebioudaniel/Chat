const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate("dmPartners", "userId username");
    if (!me) return res.json([]);

    const partners = me.dmPartners || [];
    const conversations = await Promise.all(
      partners.map(async (partner) => {
        const threadIds = [
          `${req.user._id}:${partner._id}`,
          `${partner._id}:${req.user._id}`,
        ];
        const lastMsg = await Message.findOne({
          threadId: { $in: threadIds },
        })
          .sort({ timestamp: -1 })
          .lean();

        return {
          user: { _id: partner._id, userId: partner.userId, username: partner.username },
          lastMessage: lastMsg
            ? { content: lastMsg.content, timestamp: lastMsg.timestamp, sender: lastMsg.sender }
            : null,
        };
      })
    );

    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });

    res.json(conversations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
