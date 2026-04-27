import { io } from "socket.io-client";

let socket = null;
let currentUser = null;

// ✅ CONNECT ONLY AFTER AUTH
export function connectSocket(user) {
  if (!user) {
    console.warn("⛔ No user provided to socket");
    return null;
  }

  // prevent duplicate socket
  if (socket && socket.connected) {
    return socket;
  }

  currentUser = user;

  socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3000", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    autoConnect: false, // ❗ critical
  });

  socket.connect();

  // ✅ send identity ONLY after connection
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);

    socket.emit("user:join", {
      userId: currentUser.userId,
      username: currentUser.username,
      avatar: currentUser.avatar,
      isGuest: currentUser.isGuest,
      token: currentUser.token || null,
    });
  });

  // ✅ handle reconnect properly
  socket.on("reconnect", () => {
    console.log("♻️ Reconnected");

    if (currentUser) {
      socket.emit("user:join", {
        userId: currentUser.userId,
        username: currentUser.username,
        avatar: currentUser.avatar,
        isGuest: currentUser.isGuest,
        token: currentUser.token || null,
      });
    }
  });

  socket.on("user_profile", (data) => {
    socket.userProfile = data;
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  return socket;
}

// ✅ GET SOCKET SAFELY
export function getSocket() {
  return socket;
}

// ✅ CLEANUP
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUser = null;
  }
}