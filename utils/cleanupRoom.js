export function cleanupRoom(io, roomId) {
  if (!roomId) return;

  // Notify all users in the room that the partner left
  io.to(roomId).emit("partner_left");

  // Clear roomId for all sockets in this room to prevent stale states and ghost connections
  const clients = io.sockets.adapter.rooms.get(roomId);
  if (clients) {
    for (const clientId of clients) {
      const clientSocket = io.sockets.sockets.get(clientId);
      if (clientSocket) {
        clientSocket.leave(roomId);
        clientSocket.roomId = null;
      }
    }
  }
}
