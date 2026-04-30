export default function handleMessage(io, socket, { roomId, message, type = "text", audioUrl = null }) {
  if (!roomId || socket.roomId !== roomId) return;

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Emit message to room
  io.to(roomId).emit("receive_message", {
    id: msgId,
    senderId: socket.user?.userId || socket.id,
    username: socket.user?.username || "Stranger",
    avatar: socket.user?.avatar,
    message,
    type,
    audioUrl,
    timestamp: new Date(),
    status: "sent"
  });
}