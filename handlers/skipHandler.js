import { cleanupRoom } from "../utils/cleanupRoom.js";

export default function handleSkip(io, socket) {
  console.log("⏭ Skip by:", socket.id);

  if (socket.roomId) {
    cleanupRoom(io, socket.roomId);
  }

  // Client locally handles reconnect now using partner_left or local state
}