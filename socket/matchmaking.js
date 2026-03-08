export default function handleMatch(io, socket, waitingUser) {

  console.log("🔎 Match request from:", socket.id);

  if (waitingUser && waitingUser.id !== socket.id) {

    const roomId = `${waitingUser.id}#${socket.id}`;

    socket.join(roomId);
    waitingUser.join(roomId);

    socket.roomId = roomId;
    waitingUser.roomId = roomId;

    console.log("✅ Match found:", roomId);

    io.to(waitingUser.id).emit("match_found", {
      roomId,
      initiator: true,
    });

    io.to(socket.id).emit("match_found", {
      roomId,
      initiator: false,
    });

    return null;
  }

  console.log("⏳ Waiting for partner:", socket.id);
  return socket;
}