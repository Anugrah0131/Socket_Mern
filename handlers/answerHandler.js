export default function handleAnswer(socket, { roomId, answer }) {

  if (!roomId || socket.roomId !== roomId) return;

  socket.to(roomId).emit("answer_created", {
    roomId,
    answer,
  });

}