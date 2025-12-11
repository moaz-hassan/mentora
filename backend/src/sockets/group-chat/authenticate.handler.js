import models from "../../models/index.js";

const { ChatParticipant, ChatRoom } = models;

export const authenticateHandler = (io, socket, connectedUsers) => {
  return async ({ userId }) => {
    try {
      if (!userId) {
        socket.emit("error", { message: "User ID is required" });
        return;
      }

      // Store user connection
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;

      // Join all user's chat rooms
      const participants = await ChatParticipant.findAll({
        where: { user_id: userId, is_active: true },
        include: [{ model: ChatRoom }],
      });

      participants.forEach((participant) => {
        socket.join(`room_${participant.room_id}`);
      });

      socket.emit("authenticated", {
        success: true,
        rooms: participants.map((p) => p.room_id),
      });
    } catch (error) {
      console.error("Authentication error:", error);
      socket.emit("error", { message: "Authentication failed" });
    }
  };
};
