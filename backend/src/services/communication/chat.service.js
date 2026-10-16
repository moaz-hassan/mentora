import { chatRoomRepository, chatMessageRepository, chatParticipantRepository } from "../../repositories/communication/chat.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";
import ChatRoom from "../../models/communication/chatRoom.model.js";
import ChatMessage from "../../models/communication/chatMessage.model.js";
import ChatParticipant from "../../models/communication/chatParticipant.model.js";
import User from "../../models/auth/user.model.js";

export const getAllChatRooms = async () => {
  return await ChatRoom.find().sort({ createdAt: -1 }).exec();
};

export const getChatRoomById = async (roomId) => {
  const chatRoom = await chatRoomRepository.findById(roomId);

  if (!chatRoom) {
    const error = new Error("Chat room not found");
    error.statusCode = 404;
    throw error;
  }

  return chatRoom;
};

export const getChatRoomByCourseId = async (courseId) => {
  const chatRoom = await chatRoomRepository.findByCourseId(courseId);

  if (!chatRoom) {
    const error = new Error("Chat room not found for this course");
    error.statusCode = 404;
    throw error;
  }

  return chatRoom;
};

export const createChatRoom = async (roomData) => {
  const { course_id } = roomData;

  const course = await courseRepository.findById(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const existingRoom = await chatRoomRepository.findByCourseId(course_id);
  if (existingRoom) {
    const error = new Error("Chat room already exists for this course");
    error.statusCode = 400;
    throw error;
  }

  return await chatRoomRepository.create({ course_id });
};

export const deleteChatRoom = async (roomId) => {
  const chatRoom = await chatRoomRepository.findById(roomId);

  if (!chatRoom) {
    const error = new Error("Chat room not found");
    error.statusCode = 404;
    throw error;
  }

  await ChatRoom.findByIdAndDelete(roomId);

  return { message: "Chat room deleted successfully" };
};

export const deleteCourseChat = async (courseId) => {
  const chatRoom = await chatRoomRepository.findByCourseId(courseId);

  if (!chatRoom) {
    return { message: "No chat room found for this course" };
  }

  const roomId = chatRoom._id.toString();

  await Promise.all([
    ChatParticipant.deleteMany({ room_id: roomId }),
    ChatMessage.deleteMany({ room_id: roomId }),
  ]);

  await ChatRoom.findByIdAndDelete(roomId);

  return { message: "Course chat room deleted successfully" };
};

export const getMessagesByRoomId = async (roomId) => {
  return await ChatMessage.find({ room_id: roomId })
    .sort({ createdAt: 1 })
    .exec();
};

export const getMessageById = async (messageId) => {
  const message = await ChatMessage.findById(messageId).exec();

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  return message;
};

export const createMessage = async (messageData, senderId) => {
  const { room_id, message } = messageData;

  const chatRoom = await chatRoomRepository.findById(room_id);
  if (!chatRoom) {
    const error = new Error("Chat room not found");
    error.statusCode = 404;
    throw error;
  }

  return await chatMessageRepository.create({
    room_id,
    sender_id: senderId,
    message,
  });
};

export const deleteMessage = async (messageId, userId, userRole) => {
  const message = await ChatMessage.findById(messageId).exec();

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  if (message.sender_id !== userId && userRole !== "admin") {
    const error = new Error("Not authorized to delete this message");
    error.statusCode = 403;
    throw error;
  }

  await ChatMessage.findByIdAndDelete(messageId);

  return { message: "Message deleted successfully" };
};

export const autoCreateGroupChat = async (courseId, instructorId) => {
  const existingRoom = await ChatRoom.findOne({ course_id: courseId, type: "group" }).exec();

  if (existingRoom) {
    return existingRoom;
  }

  const course = await courseRepository.findById(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const chatRoom = await chatRoomRepository.create({
    type: "group",
    course_id: courseId,
    name: `${course.title} - Group Chat`,
    created_by: instructorId,
  });

  await ChatParticipant.create({
    room_id: chatRoom._id.toString(),
    user_id: instructorId,
    role: "admin",
    is_active: true,
  });

  return chatRoom;
};

export const addStudentToGroupChat = async (courseId, studentId) => {
  const chatRoom = await ChatRoom.findOne({ course_id: courseId, type: "group" }).exec();

  if (!chatRoom) {
    const error = new Error("Group chat not found for this course");
    error.statusCode = 404;
    throw error;
  }

  const roomId = chatRoom._id.toString();
  const existingParticipant = await chatParticipantRepository.findOne({
    room_id: roomId,
    user_id: studentId,
  });

  if (existingParticipant) {
    if (!existingParticipant.is_active) {
      await ChatParticipant.findByIdAndUpdate(existingParticipant._id, { $set: { is_active: true } });
    }
    return existingParticipant;
  }

  return await ChatParticipant.create({
    room_id: roomId,
    user_id: studentId,
    role: "member",
    is_active: true,
  });
};

export const checkChatMembership = async (courseId, userId) => {
  const chatRoom = await ChatRoom.findOne({ course_id: courseId, type: "group" }).exec();

  if (!chatRoom) {
    return { isMember: false, roomId: null };
  }

  const participant = await chatParticipantRepository.findOne({
    room_id: chatRoom._id.toString(),
    user_id: userId,
    is_active: true,
  });

  return {
    isMember: !!participant,
    roomId: participant ? chatRoom._id.toString() : null,
  };
};

export const createPrivateChat = async (studentId, instructorId, courseId = null) => {
  // Check for existing private chat between these two users
  const existingRooms = await ChatRoom.find({ type: "private" }).exec();

  for (const room of existingRooms) {
    const roomId = room._id.toString();
    const participants = await ChatParticipant.find({ room_id: roomId }).exec();
    const participantIds = participants.map((p) => p.user_id);

    if (participantIds.includes(studentId) && participantIds.includes(instructorId)) {
      return room;
    }
  }

  const [student, instructor] = await Promise.all([
    User.findById(studentId).exec(),
    User.findById(instructorId).exec(),
  ]);

  if (!student || !instructor) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const chatRoom = await chatRoomRepository.create({
    type: "private",
    course_id: courseId,
    name: `${student.first_name} ${student.last_name} & ${instructor.first_name} ${instructor.last_name}`,
    created_by: studentId,
  });

  const roomId = chatRoom._id.toString();

  await ChatParticipant.insertMany([
    { room_id: roomId, user_id: studentId, role: "member", is_active: true },
    { room_id: roomId, user_id: instructorId, role: "member", is_active: true },
  ]);

  return chatRoom;
};

export const getUserChatRooms = async (userId) => {
  const participants = await ChatParticipant.find({ user_id: userId, is_active: true }).exec();

  const chatRooms = await Promise.all(
    participants.map(async (p) => {
      const room = await ChatRoom.findById(p.room_id).exec();
      if (!room) return null;

      const [lastMessage, unreadCount] = await Promise.all([
        ChatMessage.findOne({ room_id: p.room_id })
          .sort({ createdAt: -1 })
          .exec(),
        ChatMessage.countDocuments({
          room_id: p.room_id,
          createdAt: { $gt: p.last_read_at || new Date(0) },
          sender_id: { $ne: userId },
        }),
      ]);

      const roomData = room.toJSON();
      roomData.lastMessage = lastMessage;
      roomData.unreadCount = unreadCount;
      return roomData;
    })
  );

  return chatRooms.filter(Boolean);
};

export const markChatAsRead = async (roomId, userId) => {
  const participant = await chatParticipantRepository.findOne({ room_id: roomId, user_id: userId });

  if (!participant) {
    const error = new Error("User is not a participant of this chat room");
    error.statusCode = 403;
    throw error;
  }

  return await chatParticipantRepository.updateLastRead(roomId, userId);
};

export const getUnreadCount = async (userId) => {
  const participants = await ChatParticipant.find({ user_id: userId, is_active: true }).exec();

  let totalUnread = 0;

  for (const participant of participants) {
    const unreadCount = await ChatMessage.countDocuments({
      room_id: participant.room_id,
      createdAt: { $gt: participant.last_read_at || new Date(0) },
      sender_id: { $ne: userId },
    });
    totalUnread += unreadCount;
  }

  return totalUnread;
};

export const getRoomMessages = async (roomId, userId, limit = 50, offset = 0) => {
  const participant = await chatParticipantRepository.findOne({ room_id: roomId, user_id: userId });

  if (!participant) {
    const error = new Error("User is not a participant of this chat room");
    error.statusCode = 403;
    throw error;
  }

  const messages = await ChatMessage.find({ room_id: roomId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .exec();

  // Attach user data
  const messagesWithUser = await Promise.all(
    messages.map(async (msg) => {
      const user = await User.findById(msg.sender_id).select("first_name last_name email role profile").exec();
      const msgObj = msg.toJSON();
      msgObj.User = user
        ? {
            id: user._id.toString(),
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            Profile: { avatar_url: user.profile?.avatar_url || "" },
          }
        : null;
      return msgObj;
    })
  );

  return {
    messages: messagesWithUser.reverse(),
    lastReadAt: participant.last_read_at,
  };
};

export const getRoomMessagesWithCursor = async (roomId, userId, cursor = null, limit = 20) => {
  const participant = await chatParticipantRepository.findOne({ room_id: roomId, user_id: userId });

  if (!participant) {
    const error = new Error("User is not a participant of this chat room");
    error.statusCode = 403;
    throw error;
  }

  // Try Redis cache for first page
  if (!cursor) {
    try {
      const { getCachedMessages, isRedisAvailable } = await import("../../utils/redis.util.js");
      if (isRedisAvailable()) {
        const cachedMessages = await getCachedMessages(roomId, limit + 1);
        if (cachedMessages && cachedMessages.length > 0) {
          const hasMore = cachedMessages.length > limit;
          const messages = hasMore ? cachedMessages.slice(0, limit) : cachedMessages;
          const nextCursor = hasMore ? cachedMessages[limit - 1].created_at : null;
          return { messages: messages.reverse(), hasMore, nextCursor, lastReadAt: participant.last_read_at, fromCache: true };
        }
      }
    } catch (err) {
      console.warn("Redis cache miss or unavailable:", err.message);
    }
  }

  const filter = { room_id: roomId };
  if (cursor) filter.createdAt = { $lt: new Date(cursor) };

  const messages = await ChatMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .exec();

  const hasMore = messages.length > limit;
  const resultMessages = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore && resultMessages.length > 0 ? resultMessages[resultMessages.length - 1].createdAt.toISOString() : null;

  // Attach user data and populate cache
  const messagesWithUser = await Promise.all(
    resultMessages.map(async (msg) => {
      const user = await User.findById(msg.sender_id).select("first_name last_name email role profile").exec();
      const msgObj = msg.toJSON();
      msgObj.User = user
        ? {
            id: user._id.toString(),
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            Profile: { avatar_url: user.profile?.avatar_url || "" },
          }
        : null;
      return msgObj;
    })
  );

  if (!cursor && messagesWithUser.length > 0) {
    try {
      const { addMessageToCache, isRedisAvailable } = await import("../../utils/redis.util.js");
      if (isRedisAvailable()) {
        for (const msg of messagesWithUser) {
          await addMessageToCache(roomId, {
            id: msg.id,
            room_id: msg.room_id,
            sender_id: msg.sender_id,
            message: msg.message,
            message_type: msg.message_type,
            file_url: msg.file_url,
            created_at: msg.createdAt?.toISOString?.() || msg.createdAt,
            User: msg.User,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to populate Redis cache:", err.message);
    }
  }

  return { messages: messagesWithUser.reverse(), hasMore, nextCursor, lastReadAt: participant.last_read_at, fromCache: false };
};

export const createMessageWithCache = async (messageData, senderId) => {
  const { room_id, message, message_type = "text", file_url = null } = messageData;

  const chatRoom = await chatRoomRepository.findById(room_id);
  if (!chatRoom) {
    const error = new Error("Chat room not found");
    error.statusCode = 404;
    throw error;
  }

  const chatMessage = await chatMessageRepository.create({
    room_id,
    sender_id: senderId,
    message,
    message_type,
    file_url,
  });

  const user = await User.findById(senderId).select("first_name last_name email role profile").exec();
  const msgObj = chatMessage.toJSON();
  msgObj.User = user
    ? {
        id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        Profile: { avatar_url: user.profile?.avatar_url || "" },
      }
    : null;

  try {
    const { addMessageToCache, isRedisAvailable } = await import("../../utils/redis.util.js");
    if (isRedisAvailable()) {
      await addMessageToCache(room_id, {
        id: msgObj.id,
        room_id: msgObj.room_id,
        sender_id: msgObj.sender_id,
        message: msgObj.message,
        message_type: msgObj.message_type,
        file_url: msgObj.file_url,
        created_at: chatMessage.createdAt?.toISOString() || new Date().toISOString(),
        User: msgObj.User,
      });
    }
  } catch (err) {
    console.warn("Failed to add message to Redis cache:", err.message);
  }

  return msgObj;
};

export default {
  getAllChatRooms,
  getChatRoomById,
  getChatRoomByCourseId,
  createChatRoom,
  deleteChatRoom,
  deleteCourseChat,
  getMessagesByRoomId,
  getMessageById,
  createMessage,
  deleteMessage,
  autoCreateGroupChat,
  addStudentToGroupChat,
  checkChatMembership,
  createPrivateChat,
  getUserChatRooms,
  markChatAsRead,
  getUnreadCount,
  getRoomMessages,
  getRoomMessagesWithCursor,
  createMessageWithCache,
};
