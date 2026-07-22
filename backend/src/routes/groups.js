const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const Group = require("../models/Group");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/", authMiddleware, validate(["name", "memberIds"]), async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: "memberIds must be a non-empty array" });
    }

    const lookupIds = [...new Set(memberIds)];
    const users = await User.find({ userId: { $in: lookupIds } });
    if (users.length !== lookupIds.length) {
      return res.status(400).json({ error: "One or more user IDs not found" });
    }

    const memberObjectIds = users.map((u) => u._id);
    const allMemberIds = [...new Set([req.user._id, ...memberObjectIds])];

    const groupId = crypto.randomUUID().slice(0, 8);
    await Group.create({ groupId, name: name.trim(), members: allMemberIds });

    for (const uid of allMemberIds) {
      await User.updateOne({ _id: uid }, { $addToSet: { groups: groupId } });
    }

    const memberUsers = await User.find({ _id: { $in: allMemberIds } }).select("userId username");
    res.status(201).json({
      groupId,
      name: name.trim(),
      members: memberUsers.map((u) => ({ _id: u._id.toString(), userId: u.userId, username: u.username })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({ groupId: { $in: req.user.groups } }).populate(
      "members",
      "userId username"
    );
    const result = groups.map((g) => ({
      groupId: g.groupId,
      name: g.name,
      members: g.members.map((m) => ({
        _id: m._id.toString(),
        userId: m.userId,
        username: m.username,
      })),
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
