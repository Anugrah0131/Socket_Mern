import { cleanupRoom } from "../utils/cleanupRoom.js";

export default function handleSkip(io, socket) {
  console.log("⏭ Skip by:", socket.id);

  if (socket.roomId) {
    cleanupRoom(io, socket.roomId);
  }

  socket.emit("reset_chat");
}