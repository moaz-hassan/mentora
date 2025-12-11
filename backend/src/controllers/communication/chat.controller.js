import * as chatService from "../../services/communication/chat.service.js";

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

export const getRoomMessagesPaginated = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const { messages, lastReadAt } = await chatService.getRoomMessages(
      roomId,
      req.user.id,
      limit,
      offset
    );
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
      lastReadAt,
    });
  } catch (error) {
    next(error);
  }
};


export const joinGroupChat = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    const participant = await chatService.addStudentToGroupChat(courseId, studentId);

    res.status(200).json({
      success: true,
      message: "Joined chat successfully",
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};


export const checkChatMembership = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const result = await chatService.checkChatMembership(courseId, userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const getRoomMessagesWithCursor = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const cursor = req.query.cursor || null;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await chatService.getRoomMessagesWithCursor(
      roomId,
      req.user.id,
      cursor,
      limit
    );
    
    res.status(200).json({
      success: true,
      messages: result.messages,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      lastReadAt: result.lastReadAt,
      fromCache: result.fromCache,
    });
  } catch (error) {
    next(error);
  }
};


export const sendMessageWithCache = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { message, message_type, file_url } = req.body;
    
    const newMessage = await chatService.createMessageWithCache(
      { room_id: roomId, message, message_type, file_url },
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
