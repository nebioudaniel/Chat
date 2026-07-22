const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const Group = require("../models/Group");
const Message = require("../models/Message");

const socketToUser = new Map();
const onlineDbIds = new Set();

const windowMs = 60 * 1000;
const maxMessages = 30;
const messageHits = new Map();

setInterval(() => {
  for (const [key, data] of messageHits) {
    if (Date.now() - data.windowStart > windowMs) messageHits.delete(key);
  }
}, windowMs);

function checkRateLimit(dbId) {
  const now = Date.now();
  const entry = messageHits.get(dbId);
  if (!entry || now - entry.windowStart > windowMs) {
    messageHits.set(dbId, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= maxMessages;
}

function setupSockets(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.dbId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const dbId = socket.dbId;
    console.log(`Socket connected: ${socket.id} (user: ${dbId})`);

    socketToUser.set(socket.id, dbId);
    onlineDbIds.add(dbId);

    socket.join(`user:${dbId}`);

    io.emit("presence", { online: [...onlineDbIds] });

    const user = await User.findById(dbId);
    if (user?.groups?.length) {
      const groups = await Group.find({ groupId: { $in: user.groups } });
      for (const g of groups) {
        socket.join(`group:${g.groupId}`);
      }
    }

    socket.on("send-message", async ({ threadId, content, type, groupId }) => {
      const senderDbId = socketToUser.get(socket.id);
      if (!senderDbId) return;

      if (!content || !content.trim() || !threadId || !type) return;
      if (!checkRateLimit(senderDbId)) {
        socket.emit("error", { message: "Rate limit exceeded" });
        return;
      }

      const sender = await User.findById(senderDbId).select("userId username");
      if (!sender) return;

      const msg = await Message.create({
        threadId,
        sender: sender._id.toString(),
        senderName: sender.username,
        content: content.trim(),
      });

      if (type === "dm") {
        const parts = threadId.split(":");
        for (const uid of parts) {
          io.to(`user:${uid}`).emit("receive-message", { threadId, message: msg });
        }

        for (const uid of parts) {
          await User.findByIdAndUpdate(uid, { $addToSet: { dmPartners: parts.filter((p) => p !== uid) } });
        }
      } else if (type === "group" && groupId) {
        io.to(`group:${groupId}`).emit("receive-message", { threadId, message: msg });
      }
    });

    socket.on("join-group", ({ groupId }) => {
      if (groupId) socket.join(`group:${groupId}`);
    });

    socket.on("disconnect", () => {
      socketToUser.delete(socket.id);

      let stillConnected = false;
      for (const [, uid] of socketToUser) {
        if (uid === dbId) {
          stillConnected = true;
          break;
        }
      }
      if (!stillConnected) {
        onlineDbIds.delete(dbId);
        io.emit("presence", { online: [...onlineDbIds] });
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSockets, onlineDbIds };
