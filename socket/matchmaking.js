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
    let u1Index = 0;
    let u2Index = 1;

    if (waitingQueue[u1Index].lastPartner === waitingQueue[u2Index].id) {
      if (waitingQueue.length > 2) {
        u2Index = 2; // pick a different partner
      }
      // If there are only 2 people on the platform, we allow them to reconnect
      // rather than freezing the application completely.
    }

    const user1 = waitingQueue.splice(u1Index, 1)[0];
    const user2 = waitingQueue.splice(u2Index - 1, 1)[0];

    user1.lastPartner = user2.id;
    user2.lastPartner = user1.id;

    const roomId = `${user1.id}#${user2.id}`;

    user1.join(roomId);
    user2.join(roomId);

    user1.roomId = roomId;
    user2.roomId = roomId;

    console.log("✅ Match found:", roomId);

    io.to(user1.id).emit("match_found", {
      roomId,
      initiator: true,
      partner: {
        username: user2.user?.username || "Stranger",
        avatar: user2.user?.avatar,
      },
    });

    io.to(user2.id).emit("match_found", {
      roomId,
      initiator: false,
      partner: {
        username: user1.user?.username || "Stranger",
        avatar: user1.user?.avatar,
      },
    });
  }
}