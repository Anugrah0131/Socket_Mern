import { cleanupRoom } from "../utils/cleanupRoom.js";

export default function handleMatch(io, socket, waitingQueue) {

  console.log("🔎 Match request from:", socket.id);

  // Prevent duplicate entries
  if (waitingQueue.some(s => s.id === socket.id)) {
    return;
  }

  // If already in a room, securely clean up both peers to avoid ghost connections
  if (socket.roomId) {
    cleanupRoom(io, socket.roomId);
  }

  console.log("⏳ Waiting for partner:", socket.id);
  waitingQueue.push(socket);

  if (waitingQueue.length >= 2) {
    const user1 = waitingQueue.shift();
    const user2 = waitingQueue.shift();

    const roomId = `${user1.id}#${user2.id}`;

    user1.join(roomId);
    user2.join(roomId);

    user1.roomId = roomId;
    user2.roomId = roomId;

    console.log("✅ Match found:", roomId);

    io.to(user1.id).emit("match_found", {
      roomId,
      initiator: true,
    });

    io.to(user2.id).emit("match_found", {
      roomId,
      initiator: false,
    });
  }
}