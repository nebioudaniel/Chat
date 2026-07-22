const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

async function generateUserId() {
  let id;
  let exists = true;
  while (exists) {
    id = String(Math.floor(10000 + Math.random() * 90000));
    exists = await User.exists({ userId: id });
  }
  return id;
}

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const userId = await generateUserId();
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, userId, passwordHash, groups: [] });
    const token = signToken(user);

    res.status(201).json({ _id: user._id.toString(), userId: user.userId, username: user.username, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ _id: user._id.toString(), userId: user.userId, username: user.username, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    _id: req.user._id.toString(),
    userId: req.user.userId,
    username: req.user.username,
    groups: req.user.groups,
  });
});

router.patch("/userid", authMiddleware, async (req, res) => {
  try {
    const newUserId = await generateUserId();
    await User.updateOne({ _id: req.user._id }, { userId: newUserId });

    const updatedUser = await User.findById(req.user._id).select("-passwordHash");
    const token = signToken(updatedUser);

    res.json({ _id: updatedUser._id.toString(), userId: updatedUser.userId, username: updatedUser.username, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
