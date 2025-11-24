import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import { createChatRoomValidator, createMessageValidator, chatRoomIdValidator, messageIdValidator } from "../validators/chat.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ============ CHAT ROOM ROUTES ============

// GET /api/chat/rooms - Get all chat rooms
router.get("/rooms", authenticate, chatController.getAllChatRooms);

// GET /api/chat/rooms/:id - Get chat room by ID
router.get("/rooms/:id", authenticate, chatRoomIdValidator, validateResult, chatController.getChatRoomById);

// GET /api/chat/rooms/course/:courseId - Get chat room by course ID
router.get("/rooms/course/:courseId", authenticate, chatController.getChatRoomByCourseId);

// POST /api/chat/rooms - Create a new chat room (instructor/admin only)
router.post("/rooms", authenticate, authorize("instructor", "admin"), createChatRoomValidator, validateResult, chatController.createChatRoom);

// DELETE /api/chat/rooms/:id - Delete chat room (admin only)
router.delete("/rooms/:id", authenticate, authorize("admin"), chatRoomIdValidator, validateResult, chatController.deleteChatRoom);

// GET /api/chat/rooms/:roomId/messages - Get all messages for a chat room
router.get("/rooms/:roomId/messages", authenticate, chatController.getMessagesByRoomId);

// ============ CHAT MESSAGE ROUTES ============

// GET /api/chat/messages/:id - Get message by ID
router.get("/messages/:id", authenticate, messageIdValidator, validateResult, chatController.getMessageById);

// POST /api/chat/messages - Create a new message
router.post("/messages", authenticate, createMessageValidator, validateResult, chatController.createMessage);

// DELETE /api/chat/messages/:id - Delete message
router.delete("/messages/:id", authenticate, messageIdValidator, validateResult, chatController.deleteMessage);

// ============ ENHANCED CHAT ROUTES ============

// GET /api/chat/user/rooms - Get user's chat rooms (group and private)
router.get("/user/rooms", authenticate, chatController.getUserChatRooms);

// POST /api/chat/private - Create private chat room
router.post("/private", authenticate, chatController.createPrivateChat);

// PUT /api/chat/rooms/:roomId/read - Mark room as read
router.put("/rooms/:roomId/read", authenticate, chatController.markChatAsRead);

// GET /api/chat/unread-count - Get unread message count
router.get("/unread-count", authenticate, chatController.getUnreadCount);

// GET /api/chat/rooms/:roomId/messages/paginated - Get messages with pagination
router.get("/rooms/:roomId/messages/paginated", authenticate, chatController.getRoomMessagesPaginated);

export default router;
