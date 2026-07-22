const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne(
      { userId: req.params.userId },
      { username: 1, userId: 1 }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ _id: user._id.toString(), userId: user.userId, username: user.username });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
