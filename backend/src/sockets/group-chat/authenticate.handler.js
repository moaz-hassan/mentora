import { chatParticipantRepository } from "../../repositories/communication/chat.repository.js";

export const authenticateHandler = (io, socket, connectedUsers) => {
  return async ({ userId }) => {
    try {
      if (!userId) {
        socket.emit("error", { message: "User ID is required" });
        return;
      }

      const participants = await chatParticipantRepository.findByUser(userId);
      const roomIds = participants.map((participant) => participant.room_id);

      connectedUsers.set(userId, socket.id);
      socket.userId = userId;

      roomIds.forEach((roomId) => {
        socket.join(`room_${roomId}`);
      });

      socket.emit("authenticated", {
        success: true,
        rooms: roomIds,
      });
    } catch (error) {
      console.error("Authentication error:", error);
      socket.emit("error", { message: "Authentication failed" });
    }
  };
};
