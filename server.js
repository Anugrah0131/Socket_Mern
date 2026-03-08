import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import socketHandler from "./socket/socketHandler.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://socket-mern-og.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Socket server running 🚀");
});

/*
Socket logic
*/
socketHandler(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});