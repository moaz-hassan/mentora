import { authenticateHandler } from "./group-chat/authenticate.handler.js";
import { joinRoomHandler, leaveRoomHandler } from "./group-chat/room.handler.js";
import { sendMessageHandler, typingHandler, markReadHandler } from "./group-chat/message.handler.js";
import { checkOnlineStatusHandler } from "./group-chat/status.handler.js";
import { disconnectHandler } from "./group-chat/disconnect.handler.js";

export const setupChatSocket = (io) => {
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    // Authenticate
    socket.on("authenticate", authenticateHandler(io, socket, connectedUsers));

    // Room events
    socket.on("join_room", joinRoomHandler(io, socket));
    socket.on("leave_room", leaveRoomHandler(io, socket));

    // Message events
    socket.on("send_message", sendMessageHandler(io, socket, connectedUsers));
    socket.on("typing", typingHandler(io, socket));
    socket.on("mark_read", markReadHandler(io, socket));

    // Status events
    socket.on("check_online_status", checkOnlineStatusHandler(io, socket, connectedUsers));

    // Disconnect
    socket.on("disconnect", disconnectHandler(io, socket, connectedUsers));

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};


