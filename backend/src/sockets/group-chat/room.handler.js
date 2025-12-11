import models from "../../models/index.js";

const { ChatParticipant, ChatRoom } = models;

export const joinRoomHandler = (io, socket) => {
  return async ({ roomId, userId }) => {
    try {
      const participant = await ChatParticipant.findOne({
        where: { room_id: roomId, user_id: userId },
      });

      if (!participant) {
        socket.emit("error", { message: "Not authorized to join this room" });
        return;
      }

      socket.join(`room_${roomId}`);

      const room = await ChatRoom.findByPk(roomId);

      socket.emit("room_joined", {
        roomId,
        roomName: room.name,
        roomType: room.type,
      });

      socket.to(`room_${roomId}`).emit("user_joined", {
        roomId,
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Join room error:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  };
};

export const leaveRoomHandler = (io, socket) => {
  return async ({ roomId, userId }) => {
    try {
      socket.leave(`room_${roomId}`);

      socket.to(`room_${roomId}`).emit("user_left", {
        roomId,
        userId,
        timestamp: new Date(),
      });

      console.log(`User ${userId} left room ${roomId}`);
    } catch (error) {
      console.error("Leave room error:", error);
    }
  };
};
