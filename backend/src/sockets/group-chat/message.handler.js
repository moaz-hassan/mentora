import { Op } from "sequelize";
import models from "../../models/index.js";
import { createNotification } from "../../services/communication/notification.service.js";

const { ChatMessage, ChatParticipant, ChatRoom, User } = models;

export const sendMessageHandler = (io, socket, connectedUsers) => {
  return async ({ roomId, userId, message, messageType = "text", fileUrl = null }) => {
    try {
      const participant = await ChatParticipant.findOne({
        where: { room_id: roomId, user_id: userId, is_active: true },
      });

      if (!participant) {
        socket.emit("error", { message: "Not authorized to send messages in this room" });
        return;
      }

      const user = await User.findByPk(userId, {
        attributes: ["id", "first_name", "last_name", "email", "role"],
        include: [{ model: models.Profile, attributes: ["avatar_url"] }],
      });

      const chatMessage = await ChatMessage.create({
        room_id: roomId,
        sender_id: userId,
        message: message,
        message_type: messageType,
        file_url: fileUrl,
      });

      
      try {
        const { addMessageToCache, isRedisAvailable } = await import('../../utils/redis.util.js');
        if (isRedisAvailable()) {
          await addMessageToCache(roomId, {
            id: chatMessage.id,
            room_id: roomId,
            sender_id: userId,
            message: message,
            message_type: messageType,
            file_url: fileUrl,
            created_at: chatMessage.created_at?.toISOString() || new Date().toISOString(),
            User: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              role: user.role,
              Profile: user.Profile ? { avatar_url: user.Profile.avatar_url } : null,
            },
          });
        }
      } catch (cacheError) {
        console.warn('Failed to add message to Redis cache:', cacheError.message);
      }

      const messageData = {
        id: chatMessage.id,
        roomId: roomId,
        senderId: userId,
        senderName: `${user.first_name} ${user.last_name}`,
        senderRole: user.role,
        senderAvatar: user.Profile?.avatar_url,
        message: message,
        messageType: messageType,
        fileUrl: fileUrl,
        createdAt: chatMessage.created_at,
      };

      io.to(`room_${roomId}`).emit("message_received", messageData);

      const room = await ChatRoom.findByPk(roomId);

      if (room.type === "private") {
        const otherParticipant = await ChatParticipant.findOne({
          where: {
            room_id: roomId,
            user_id: { [Op.ne]: userId },
          },
        });

        if (otherParticipant) {
          await createNotification({
            user_id: otherParticipant.user_id,
            type: "new_message",
            title: "New Message",
            message: `${user.first_name} sent you a message`, 
            
            
            
            
            related_id: roomId,
            related_type: "chat_room",
          });

          const recipientSocketId = connectedUsers.get(otherParticipant.user_id);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("new_notification", {
              type: "new_message",
              message: `New message from ${user.first_name} ${user.last_name}`,
              roomId: roomId,
            });
          }
        }
      }

      console.log(`Message sent in room ${roomId} by user ${userId}`);
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  };
};

export const typingHandler = (io, socket) => {
  return ({ roomId, userId, isTyping }) => {
    socket.to(`room_${roomId}`).emit("typing_indicator", {
      roomId,
      userId,
      isTyping,
    });
  };
};

export const markReadHandler = (io, socket) => {
  return async ({ roomId, userId }) => {
    try {
      await ChatParticipant.update(
        { last_read_at: new Date() },
        { where: { room_id: roomId, user_id: userId } }
      );

      socket.to(`room_${roomId}`).emit("messages_read", {
        roomId,
        userId,
        timestamp: new Date(),
      });

      console.log(`User ${userId} marked messages as read in room ${roomId}`);
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };
};
