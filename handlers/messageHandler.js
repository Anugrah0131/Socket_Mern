export default function handleMessage(io, socket, { roomId, message }) {

  if (!roomId) return;

  io.to(roomId).emit("receive_message", {
    sender: socket.id,
    message,
  });

}