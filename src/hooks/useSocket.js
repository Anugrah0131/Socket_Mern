import { io } from "socket.io-client";

let socket;

export function getSocket() {

  if (!socket) {

    socket = io("https://socket-mern-1.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

  }

  return socket;
}