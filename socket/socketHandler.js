import handleMatch from "./matchmaking.js";
import handleOffer from "../handlers/offerHandler.js";
import handleAnswer from "../handlers/answerHandler.js";
import handleIce from "../handlers/iceHandler.js";
import handleMessage from "../handlers/messageHandler.js";
import handleSkip from "../handlers/skipHandler.js";

let waitingUser = null;

export default function socketHandler(io) {
  io.on("connection", (socket) => {

    console.log("🟢 User connected:", socket.id);

    socket.on("find_match", () => {
      waitingUser = handleMatch(io, socket, waitingUser);
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
      handleSkip(socket);
    });

    socket.on("disconnect", () => {

      console.log("🔴 Disconnected:", socket.id);

      if (waitingUser?.id === socket.id) {
        waitingUser = null;
      }

      if (socket.roomId) {
        socket.to(socket.roomId).emit("partner_left");
      }

    });

  });
}