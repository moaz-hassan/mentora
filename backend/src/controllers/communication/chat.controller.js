/**
 * Chat Controller
 * Purpose: Handle chat room and message route handlers
 * Routes: /api/chat
 */

import * as chatService from "../../services/communication/chat.service.js";

// ============ CHAT ROOM CONTROLLERS ============

/**
 * Get all chat rooms
 * GET /api/chat/rooms
 */
export const getAllChatRooms = async (req, res, next) => {
  try {
    const chatRooms = await chatService.getAllChatRooms();
    
    res.status(200).json({
      success: true,
      count: chatRooms.length,
      data: chatRooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat room by ID
 * GET /api/chat/rooms/:id
 */
export const getChatRoomById = async (req, res, next) => {
  try {
    const chatRoom = await chatService.getChatRoomById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: chatRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat room by course ID
 * GET /api/chat/rooms/course/:courseId
 */
export const getChatRoomByCourseId = async (req, res, next) => {
  try {
    const chatRoom = await chatService.getChatRoomByCourseId(req.params.courseId);
    
    res.status(200).json({
      success: true,
      data: chatRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new chat room
 * POST /api/chat/rooms
 */
export const createChatRoom = async (req, res, next) => {
  try {
    const chatRoom = await chatService.createChatRoom(req.body);
    
    res.status(201).json({
      success: true,
      message: "Chat room created successfully",
      data: chatRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete chat room
 * DELETE /api/chat/rooms/:id
 */
export const deleteChatRoom = async (req, res, next) => {
  try {
    const result = await chatService.deleteChatRoom(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// ============ CHAT MESSAGE CONTROLLERS ============

/**
 * Get all messages for a chat room
 * GET /api/chat/rooms/:roomId/messages
 */
export const getMessagesByRoomId = async (req, res, next) => {
  try {
    const messages = await chatService.getMessagesByRoomId(req.params.roomId);
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get message by ID
 * GET /api/chat/messages/:id
 */
export const getMessageById = async (req, res, next) => {
  try {
    const message = await chatService.getMessageById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new message
 * POST /api/chat/messages
 */
export const createMessage = async (req, res, next) => {
  try {
    const message = await chatService.createMessage(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete message
 * DELETE /api/chat/messages/:id
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const result = await chatService.deleteMessage(
      req.params.id,
      req.user.id,
      req.user.role
    );
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// ============ ENHANCED CHAT CONTROLLERS ============

/**
 * Get user's chat rooms (both group and private)
 * GET /api/chat/user/rooms
 */
export const getUserChatRooms = async (req, res, next) => {
  try {
    const chatRooms = await chatService.getUserChatRooms(req.user.id);
    
    res.status(200).json({
      success: true,
      count: chatRooms.length,
      data: chatRooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create private chat room
 * POST /api/chat/private
 */
export const createPrivateChat = async (req, res, next) => {
  try {
    const { instructorId, courseId } = req.body;
    const studentId = req.user.id;
    
    const chatRoom = await chatService.createPrivateChat(
      studentId,
      instructorId,
      courseId
    );
    
    res.status(201).json({
      success: true,
      message: "Private chat created successfully",
      data: chatRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark chat room as read
 * PUT /api/chat/rooms/:roomId/read
 */
export const markChatAsRead = async (req, res, next) => {
  try {
    const result = await chatService.markChatAsRead(
      req.params.roomId,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: "Chat marked as read",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread message count
 * GET /api/chat/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await chatService.getUnreadCount(req.user.id);
    
    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages with pagination
 * GET /api/chat/rooms/:roomId/messages/paginated
 */
export const getRoomMessagesPaginated = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const messages = await chatService.getRoomMessages(
      roomId,
      req.user.id,
      limit,
      offset
    );
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
