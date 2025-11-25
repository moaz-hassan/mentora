/**
 * Chat Service
 * Purpose: Handle chat room and message-related business logic
 * Includes: CRUD operations for chat rooms and messages
 */

import models from "../../models/index.js";
import { Op } from "sequelize";

const { ChatRoom, ChatMessage, Course, User } = models;

// ============ CHAT ROOM OPERATIONS ============

/**
 * Get all chat rooms
 * @returns {Array} List of chat rooms
 */
export const getAllChatRooms = async () => {
  const chatRooms = await ChatRoom.findAll({
    include: [{ model: Course, attributes: ["id", "title"] }],
  });

  return chatRooms;
};

/**
 * Get chat room by ID
 * @param {string} roomId - Chat room ID
 * @returns {Object} Chat room object
 */
export const getChatRoomById = async (roomId) => {
  const chatRoom = await ChatRoom.findByPk(roomId, {
    include: [{ model: Course, attributes: ["id", "title"] }],
  });

  if (!chatRoom) {
    const error = new Error("Chat room not found");
    error.statusCode = 404;
    throw error;
  }

  return chatRoom;
};

/**
 * Get chat room by course ID
 * @param {string} courseId - Course ID
 * @returns {Object} Chat room object
 */
export const getChatRoomByCourseId = async (courseId) => {
  const chatRoom = await ChatRoom.findOne({
    where: { course_id: courseId },
    include: [{ model: Course, attributes: ["id", "title"] }],
  });

  if (!chatRoom) {
    const error = new Error("Chat room not found for this course");
    error.statusCode = 404;
    throw error;
  }

  return chatRoom;
};

/**
 * Create a new chat room
 * @param {Object} roomData - Chat room data
 * @returns {Object} Created chat room
 */
export const createChatRoom = async (roomData) => {
  const { course_id } = roomData;

  // Verify course exists
  const course = await Course.findByPk(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if chat room already exists for this course
  const existingRoom = await ChatRoom.findOne({ where: { course_id } });
  if (existingRoom) {
    const error = new Error("Chat room already exists for this course");
    error.statusCode = 400;
    throw error;
  }

  const chatRoom = await ChatRoom.create({ course_id });

  return chatRoom;
};

/**
 * Delete chat room
 * @param {string} roomId - Chat room ID
 * @returns {Object} Success message
 */
export const deleteChatRoom = async (roomId) => {
  const chatRoom = await ChatRoom.findByPk(roomId);

  if (!chatRoom) {
    const error = new Error("Chat room not found");
    error.statusCode = 404;
    throw error;
  }

  await chatRoom.destroy();

  return { message: "Chat room deleted successfully" };
};

// ============ CHAT MESSAGE OPERATIONS ============

/**
 * Get all messages for a chat room
 * @param {string} roomId - Chat room ID
 * @returns {Array} List of messages
 */
export const getMessagesByRoomId = async (roomId) => {
  const messages = await ChatMessage.findAll({
    where: { room_id: roomId },
    include: [{ model: User, attributes: ["id", "full_name"] }],
    order: [["sent_at", "ASC"]],
  });

  return messages;
};

/**
 * Get message by ID
 * @param {string} messageId - Message ID
 * @returns {Object} Message object
 */
export const getMessageById = async (messageId) => {
  const message = await ChatMessage.findByPk(messageId, {
    include: [{ model: User, attributes: ["id", "full_name"] }],
  });

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  return message;
};

/**
 * Create a new message
 * @param {Object} messageData - Message data
 * @param {string} senderId - Sender user ID
 * @returns {Object} Created message
 */
export const createMessage = async (messageData, senderId) => {
  const { room_id, message } = messageData;

  // Verify chat room exists
  const chatRoom = await ChatRoom.findByPk(room_id);
  if (!chatRoom) {
    const error = new Error("Chat room not found");
    error.statusCode = 404;
    throw error;
  }

  const chatMessage = await ChatMessage.create({
    room_id,
    sender_id: senderId,
    message,
  });

  return chatMessage;
};

/**
 * Delete message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID making the request
 * @param {string} userRole - Role of the user
 * @returns {Object} Success message
 */
export const deleteMessage = async (messageId, userId, userRole) => {
  const message = await ChatMessage.findByPk(messageId);

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if user is the sender or admin
  if (message.sender_id !== userId && userRole !== "admin") {
    const error = new Error("Not authorized to delete this message");
    error.statusCode = 403;
    throw error;
  }

  await message.destroy();

  return { message: "Message deleted successfully" };
};

// ============ ENHANCED CHAT ROOM MANAGEMENT ============

/**
 * Auto-create group chat room for course
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Created chat room
 */
export const autoCreateGroupChat = async (courseId, instructorId) => {
  const { ChatParticipant } = models;

  // Check if chat room already exists
  const existingRoom = await ChatRoom.findOne({
    where: { course_id: courseId, type: "group" },
  });

  if (existingRoom) {
    return existingRoom;
  }

  // Get course details
  const course = await Course.findByPk(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  // Create group chat room
  const chatRoom = await ChatRoom.create({
    type: "group",
    course_id: courseId,
    name: `${course.title} - Group Chat`,
    created_by: instructorId,
  });

  // Add instructor as admin participant
  await ChatParticipant.create({
    room_id: chatRoom.id,
    user_id: instructorId,
    role: "admin",
    is_active: true,
  });

  return chatRoom;
};

/**
 * Add student to group chat on enrollment
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student ID
 * @returns {Object} Chat participant record
 */
export const addStudentToGroupChat = async (courseId, studentId) => {
  const { ChatParticipant } = models;

  // Find group chat for course
  const chatRoom = await ChatRoom.findOne({
    where: { course_id: courseId, type: "group" },
  });

  if (!chatRoom) {
    const error = new Error("Group chat not found for this course");
    error.statusCode = 404;
    throw error;
  }

  // Check if student is already a participant
  const existingParticipant = await ChatParticipant.findOne({
    where: { room_id: chatRoom.id, user_id: studentId },
  });

  if (existingParticipant) {
    // Reactivate if inactive
    if (!existingParticipant.is_active) {
      await existingParticipant.update({ is_active: true });
    }
    return existingParticipant;
  }

  // Add student as participant
  const participant = await ChatParticipant.create({
    room_id: chatRoom.id,
    user_id: studentId,
    role: "member",
    is_active: true,
  });

  return participant;
};

/**
 * Create private chat room between student and instructor
 * @param {string} studentId - Student ID
 * @param {string} instructorId - Instructor ID
 * @param {string} courseId - Course ID (optional, for context)
 * @returns {Object} Created or existing chat room
 */
export const createPrivateChat = async (studentId, instructorId, courseId = null) => {
  const { ChatParticipant } = models;

  // Check if private chat already exists between these users
  const existingRooms = await ChatRoom.findAll({
    where: { type: "private" },
    include: [
      {
        model: ChatParticipant,
        where: { user_id: [studentId, instructorId] },
        required: true,
      },
    ],
  });

  // Find room where both users are participants
  for (const room of existingRooms) {
    const participantIds = room.ChatParticipants.map((p) => p.user_id);
    if (
      participantIds.includes(studentId) &&
      participantIds.includes(instructorId)
    ) {
      return room;
    }
  }

  // Create new private chat room
  const student = await User.findByPk(studentId);
  const instructor = await User.findByPk(instructorId);

  if (!student || !instructor) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const chatRoom = await ChatRoom.create({
    type: "private",
    course_id: courseId,
    name: `${student.first_name} ${student.last_name} & ${instructor.first_name} ${instructor.last_name}`,
    created_by: studentId,
  });

  // Add both users as participants
  await ChatParticipant.bulkCreate([
    {
      room_id: chatRoom.id,
      user_id: studentId,
      role: "member",
      is_active: true,
    },
    {
      room_id: chatRoom.id,
      user_id: instructorId,
      role: "member",
      is_active: true,
    },
  ]);

  return chatRoom;
};

/**
 * Get user's chat rooms (both group and private)
 * @param {string} userId - User ID
 * @returns {Array} List of chat rooms
 */
export const getUserChatRooms = async (userId) => {
  const { ChatParticipant } = models;

  const participants = await ChatParticipant.findAll({
    where: { user_id: userId, is_active: true },
    include: [
      {
        model: ChatRoom,
        include: [
          {
            model: Course,
            attributes: ["id", "title", "thumbnail_url"],
          },
          {
            model: ChatParticipant,
            include: [
              {
                model: User,
                attributes: ["id", "first_name", "last_name", "email"],
              },
            ],
          },
        ],
      },
    ],
  });

  const chatRooms = participants.map((p) => p.ChatRoom);

  // Get last message for each room
  for (const room of chatRooms) {
    const lastMessage = await ChatMessage.findOne({
      where: { room_id: room.id },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    room.dataValues.lastMessage = lastMessage;

    // Get unread count for user
    const participant = await ChatParticipant.findOne({
      where: { room_id: room.id, user_id: userId },
    });

    const unreadCount = await ChatMessage.count({
      where: {
        room_id: room.id,
        created_at: {
          [Op.gt]: participant.last_read_at || new Date(0),
        },
        sender_id: { [Op.ne]: userId },
      },
    });

    room.dataValues.unreadCount = unreadCount;
  }

  return chatRooms;
};

/**
 * Mark chat room as read for user
 * @param {string} roomId - Chat room ID
 * @param {string} userId - User ID
 * @returns {Object} Updated participant record
 */
export const markChatAsRead = async (roomId, userId) => {
  const { ChatParticipant } = models;

  const participant = await ChatParticipant.findOne({
    where: { room_id: roomId, user_id: userId },
  });

  if (!participant) {
    const error = new Error("User is not a participant of this chat room");
    error.statusCode = 403;
    throw error;
  }

  await participant.update({ last_read_at: new Date() });

  return participant;
};

/**
 * Get unread message count for user
 * @param {string} userId - User ID
 * @returns {number} Total unread count
 */
export const getUnreadCount = async (userId) => {
  const { ChatParticipant } = models;

  const participants = await ChatParticipant.findAll({
    where: { user_id: userId, is_active: true },
  });

  let totalUnread = 0;

  for (const participant of participants) {
    const unreadCount = await ChatMessage.count({
      where: {
        room_id: participant.room_id,
        created_at: {
          [Op.gt]: participant.last_read_at || new Date(0),
        },
        sender_id: { [Op.ne]: userId },
      },
    });
    totalUnread += unreadCount;
  }

  return totalUnread;
};

/**
 * Get messages for a room with pagination
 * @param {string} roomId - Chat room ID
 * @param {string} userId - User ID
 * @param {number} limit - Number of messages to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Array} List of messages
 */
export const getRoomMessages = async (roomId, userId, limit = 50, offset = 0) => {
  const { ChatParticipant } = models;

  // Verify user is a participant
  const participant = await ChatParticipant.findOne({
    where: { room_id: roomId, user_id: userId },
  });

  if (!participant) {
    const error = new Error("User is not a participant of this chat room");
    error.statusCode = 403;
    throw error;
  }

  const messages = await ChatMessage.findAll({
    where: { room_id: roomId },
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email", "role"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return messages.reverse(); // Return in chronological order
};
