export default function handleOffer(socket, { roomId, offer }) {

  if (!roomId || socket.roomId !== roomId) return;

  socket.to(roomId).emit("offer_created", {
    roomId,
    offer,
  });

}