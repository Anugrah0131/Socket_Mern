import handleMatch from "./matchmaking.js";
import handleOffer from "../handlers/offerHandler.js";
import handleAnswer from "../handlers/answerHandler.js";
import handleIce from "../handlers/iceHandler.js";
import handleMessage from "../handlers/messageHandler.js";
import handleSkip from "../handlers/skipHandler.js";
import { cleanupRoom } from "../utils/cleanupRoom.js";
import { verifyToken } from "../middleware/authMiddleware.js";

let waitingQueue = [];

export default function socketHandler(io) {

  io.on("connection", (socket) => {

    console.log("🟢 New socket connected:", socket.id);

    // ✅ AUTH LAYER (CRITICAL)
    socket.on("user:join", (data) => {
      try {
        const { token, userId, username, avatar, isGuest } = data;

        let userData = null;

        if (token) {
          const decoded = verifyToken(token);

          if (!decoded) {
            console.log("❌ Invalid token");
            return socket.disconnect();
          }

          userData = {
            userId: decoded.userId,
            username,
            avatar,
            isGuest: false,
          };

        } else {
          userData = {
            userId,
            username,
            avatar,
            isGuest: true,
          };
        }

        socket.user = userData;

        console.log("✅ User joined:", socket.user);

        // send profile AFTER auth
        socket.emit("user_profile", socket.user);

      } catch (err) {
        console.error("Auth error:", err);
        socket.disconnect();
      }
    });

    // ⚠️ BLOCK actions until auth is ready
    const requireAuth = (callback) => {
      return (...args) => {
        if (!socket.user) {
          console.log("⛔ Action blocked: user not authenticated");
          return;
        }
        callback(...args);
      };
    };

    // 🎯 MATCHMAKING (UNCHANGED LOGIC, just protected)
    socket.on("find_match", requireAuth(() => {
      waitingQueue = waitingQueue.filter(s => s.connected && s.user);
      handleMatch(io, socket, waitingQueue);
    }));

    socket.on("create_offer", requireAuth((data) => {
      handleOffer(socket, data);
    }));

    socket.on("create_answer", requireAuth((data) => {
      handleAnswer(socket, data);
    }));

    socket.on("ice_candidate", requireAuth((data) => {
      handleIce(socket, data);
    }));

    socket.on("send_message", requireAuth((data) => {
      handleMessage(io, socket, data);
    }));

    socket.on("skip", requireAuth(() => {
      const queueIndex = waitingQueue.findIndex(s => s.id === socket.id);
      if (queueIndex !== -1) waitingQueue.splice(queueIndex, 1);

      handleSkip(io, socket);
    }));

    socket.on("leave_room", requireAuth(() => {
      const queueIndex = waitingQueue.findIndex(s => s.id === socket.id);
      if (queueIndex !== -1) waitingQueue.splice(queueIndex, 1);

      if (socket.roomId) {
        cleanupRoom(io, socket.roomId);
      }
      socket.roomId = null;
    }));

    // 🔴 SINGLE CLEAN DISCONNECT HANDLER
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id, socket.user?.userId);

      // remove from queue
      waitingQueue = waitingQueue.filter((s) => s.id !== socket.id);

      // cleanup room
      if (socket.roomId) {
        cleanupRoom(io, socket.roomId);
      }
    });

  });

}