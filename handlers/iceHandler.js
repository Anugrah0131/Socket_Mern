export default function handleIce(socket, { roomId, candidate }) {

  if (!roomId) return;

  socket.to(roomId).emit("ice_candidate", {
    candidate,
  });

}