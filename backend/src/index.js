const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const config = require("./config");
const { setupSockets } = require("./sockets");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.frontendUrl || "*" },
});

app.use(cors({ origin: config.frontendUrl || "*" }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/users"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/conversations", require("./routes/conversations"));

setupSockets(io);

mongoose
  .connect(config.mongoUri)
  .then(() => {
    server.listen(config.port, () => {
      console.log(`Backend running on http://localhost:${config.port}`);
    });
  })
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });
