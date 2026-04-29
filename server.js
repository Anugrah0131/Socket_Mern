import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import socketHandler from "./socket/socketHandler.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/socket_mern")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://socket-mern-og.onrender.com",
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Socket server running 🚀");
});

// API Routes
app.use("/api/auth", authRoutes);

// Production Grade: Dynamic Endpoint for STUN/TURN delivery
app.get("/api/ice-servers", (req, res) => {
  // Attach safe CORS headers manually mirroring our Socket config
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Base STUN fallback servers
  const iceServers = [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302"
      ]
    }
  ];

  // FUTURE: Inject TURN server details via Environment Variables here
  // if (process.env.TURN_URL) {
  //   iceServers.push({
  //     urls: process.env.TURN_URL,
  //     username: process.env.TURN_USERNAME,
  //     credential: process.env.TURN_PASSWORD
  //   });
  // }

  res.json(iceServers);
});

/*
Socket logic
*/
socketHandler(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});