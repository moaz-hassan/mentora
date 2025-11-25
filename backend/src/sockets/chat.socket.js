import { Op } from "sequelize";
import models from "../models/index.js";
import { createNotification } from "../services/communication/notification.service.js";

const { ChatMessage, ChatParticipant, ChatRoom, User } = models;

/**
 * Socket.IO Chat Handler
 * Manages real-time chat functionality for group and private chats
 */
export const setupChatSocket = (io) => {
  // Store connected users: { userId: socketId }
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    /**
     * Authenticate user and store connection
     * Client should emit this immediately after connecting
     */
    socket.on("authenticate", async ({ userId }) => {
      try {
        if (!userId) {
          socket.emit("error", { message: "User ID is required" });
          return;
        }

        // Store user connection
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;

        console.log(`User ${userId} authenticated with socket ${socket.id}`);

        // Join all user's chat rooms
        const participants = await ChatParticipant.findAll({
          where: { user_id: userId, is_active: true },
          include: [{ model: ChatRoom, as: "room" }],
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
    });

    /**
     * Join a specific chat room
     */
    socket.on("join_room", async ({ roomId, userId }) => {
      try {
        // Verify user is a participant
        const participant = await ChatParticipant.findOne({
          where: { room_id: roomId, user_id: userId },
        });

        if (!participant) {
          socket.emit("error", { message: "Not authorized to join this room" });
          return;
        }

        // Join the room
        socket.join(`room_${roomId}`);

        // Get room info
        const room = await ChatRoom.findByPk(roomId);

        socket.emit("room_joined", {
          roomId,
          roomName: room.name,
          roomType: room.type,
        });

        // Notify other participants
        socket.to(`room_${roomId}`).emit("user_joined", {
          roomId,
          userId,
          timestamp: new Date(),
        });

        console.log(`User ${userId} joined room ${roomId}`);
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    /**
     * Leave a chat room
     */
    socket.on("leave_room", async ({ roomId, userId }) => {
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
    });

    /**
     * Send a message to a chat room
     */
    socket.on("send_message", async ({ roomId, userId, message, messageType = "text", fileUrl = null }) => {
      try {
        // Verify user is an active participant
        const participant = await ChatParticipant.findOne({
          where: { room_id: roomId, user_id: userId, is_active: true },
        });

        if (!participant) {
          socket.emit("error", { message: "Not authorized to send messages in this room" });
          return;
        }

        // Get user info
        const user = await User.findByPk(userId, {
          attributes: ["id", "name", "email", "role"],
        });

        // Create message in database
        const chatMessage = await ChatMessage.create({
          room_id: roomId,
          sender_id: userId,
          message: message,
          message_type: messageType,
          file_url: fileUrl,
        });

        // Prepare message data
        const messageData = {
          id: chatMessage.id,
          roomId: roomId,
          senderId: userId,
          senderName: user.name,
          senderRole: user.role,
          message: message,
          messageType: messageType,
          fileUrl: fileUrl,
          createdAt: chatMessage.created_at,
        };

        // Broadcast message to all participants in the room
        io.to(`room_${roomId}`).emit("message_received", messageData);

        // Get room info to determine if we need to send notifications
        const room = await ChatRoom.findByPk(roomId);

        // Send notifications to offline users or users not in the room
        if (room.type === "private") {
          // For private chats, notify the other participant
          const otherParticipant = await ChatParticipant.findOne({
            where: {
              room_id: roomId,
              user_id: { [Op.ne]: userId },
            },
          });

          if (otherParticipant) {
            // Create notification
            await createNotification({
              user_id: otherParticipant.user_id,
              type: "new_message",
              title: "New Message",
              message: `${user.name} sent you a message`,
              related_id: roomId,
              related_type: "chat_room",
            });

            // Emit notification if user is online
            const recipientSocketId = connectedUsers.get(otherParticipant.user_id);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("new_notification", {
                type: "new_message",
                message: `New message from ${user.name}`,
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
    });

    /**
     * Typing indicator
     */
    socket.on("typing", ({ roomId, userId, isTyping }) => {
      socket.to(`room_${roomId}`).emit("typing_indicator", {
        roomId,
        userId,
        isTyping,
      });
    });

    /**
     * Mark messages as read
     */
    socket.on("mark_read", async ({ roomId, userId }) => {
      try {
        // Update last_read_at for the participant
        await ChatParticipant.update(
          { last_read_at: new Date() },
          { where: { room_id: roomId, user_id: userId } }
        );

        // Notify other participants
        socket.to(`room_${roomId}`).emit("messages_read", {
          roomId,
          userId,
          timestamp: new Date(),
        });

        console.log(`User ${userId} marked messages as read in room ${roomId}`);
      } catch (error) {
        console.error("Mark read error:", error);
      }
    });

    /**
     * Get online status of users
     */
    socket.on("check_online_status", ({ userIds }) => {
      const onlineStatus = {};
      userIds.forEach((userId) => {
        onlineStatus[userId] = connectedUsers.has(userId);
      });
      socket.emit("online_status", onlineStatus);
    });

    /**
     * Handle disconnection
     */
    socket.on("disconnect", () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
      console.log("Socket disconnected:", socket.id);
    });

    /**
     * Handle errors
     */
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

