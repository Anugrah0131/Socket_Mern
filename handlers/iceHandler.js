export default function handleIce(socket, { roomId, candidate }) {

  if (!roomId || socket.roomId !== roomId) return;

  socket.to(roomId).emit("ice_candidate", {
    candidate,
  });

}