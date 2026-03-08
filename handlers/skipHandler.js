export default function handleSkip(socket) {

  console.log("⏭ Skip by:", socket.id);

  if (socket.roomId) {

    socket.to(socket.roomId).emit("partner_left");

    socket.leave(socket.roomId);
    socket.roomId = null;

  }

  socket.emit("reset_chat");

}