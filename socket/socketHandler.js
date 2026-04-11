import handleMatch from "./matchmaking.js";
import handleOffer from "../handlers/offerHandler.js";
import handleAnswer from "../handlers/answerHandler.js";
import handleIce from "../handlers/iceHandler.js";
import handleMessage from "../handlers/messageHandler.js";
import handleSkip from "../handlers/skipHandler.js";
import { v4 as uuidv4 } from "uuid";
import { generateUsername } from "../utils/generateUsername.js";
import { generateAvatar } from "../utils/generateAvatar.js";
import { cleanupRoom } from "../utils/cleanupRoom.js";

let waitingQueue = [];

export default function socketHandler(io) {

  io.on("connection", (socket) => {

    console.log("🟢 User connected:", socket.id);

    // Create user identity
    const id = uuidv4();
    const username = generateUsername();
    const avatar = generateAvatar(id);


    // Send profile to frontend
socket.user = {
  id,
  username,
  avatar,
    country: "unknown",
  friends: [],
  blocked: []
};

console.log("User connected:", socket.user)

// send profile immediately
socket.emit("user_profile", socket.user);

    socket.on("find_match", () => {
      handleMatch(io, socket, waitingQueue);
    });

    socket.on("create_offer", (data) => {
      handleOffer(socket, data);
    });

    socket.on("create_answer", (data) => {
      handleAnswer(socket, data);
    });

    socket.on("ice_candidate", (data) => {
      handleIce(socket, data);
    });

    socket.on("send_message", (data) => {
      handleMessage(io, socket, data);
    });

    socket.on("skip", () => {
      handleSkip(io, socket);
    });

    socket.on("disconnect", () => {

      console.log("🔴 Disconnected:", socket.id);

      // Remove from waiting queue if present
      waitingQueue = waitingQueue.filter((s) => s.id !== socket.id);

      if (socket.roomId) {
        cleanupRoom(io, socket.roomId);
      }

    });

  });

}