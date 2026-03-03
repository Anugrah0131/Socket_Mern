import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("find_match", () => {
    if (waitingUser && waitingUser.id !== socket.id) {
      const roomId = waitingUser.id + "#" + socket.id;

      socket.join(roomId);
      waitingUser.join(roomId);

      socket.roomId = roomId;
      waitingUser.roomId = roomId;

      io.to(waitingUser.id).emit("match_found",{
        roomId,
        initiator: true,
      });
      io.to(socket.id).emit("match_found", {
        roomId,
        initiator: false,
      });
    

      waitingUser = null;
    } else {
      waitingUser = socket;
    }
  });

  socket.on("create_offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer_created", {
      roomId,
      offer,
    });
  });

  socket.on("create_answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer_created", {
      roomId,
      answer,
    });
  });

  socket.on("ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice_candidate", {
      candidate,
    });
  });

  socket.on("send_message", ({ roomId, message }) => {
    io.to(roomId).emit("receive_message", {
      sender: socket.id,
      message,
    });
  });

  socket.on("skip", () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("partner_left");
      socket.leave(socket.roomId);
      socket.roomId = null;
    }
    socket.emit("reset_chat");
  });

  socket.on("disconnect", () => {
    if (waitingUser?.id === socket.id) {
      waitingUser = null;
    }

    if (socket.roomId) {
      socket.to(socket.roomId).emit("partner_left");
    }

     });
});

httpServer.listen(3000, () => {
  console.log("Server running on 3000");
});