import ChatRoom from "../../models/communication/chatRoom.model.js";
import ChatMessage from "../../models/communication/chatMessage.model.js";
import ChatParticipant from "../../models/communication/chatParticipant.model.js";

class ChatRoomRepository {
  async findById(id) {
    return await ChatRoom.findById(id).exec();
  }

  async findByCourseId(courseId, type = null) {
    const filter = { course_id: courseId };
    if (type) filter.type = type;
    return await ChatRoom.findOne(filter).exec();
  }

  async create(data) {
    return await ChatRoom.create(data);
  }

  async updateById(id, updateData) {
    return await ChatRoom.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }
}

class ChatMessageRepository {
  async create(data) {
    return await ChatMessage.create(data);
  }

  async findByRoomId(roomId, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await ChatMessage.find({ room_id: roomId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }
}

class ChatParticipantRepository {
  async findOne(filter) {
    return await ChatParticipant.findOne(filter).exec();
  }

  async findByRoom(roomId) {
    return await ChatParticipant.find({ room_id: roomId }).exec();
  }

  async create(data) {
    return await ChatParticipant.create(data);
  }

  async updateLastRead(roomId, userId) {
    return await ChatParticipant.findOneAndUpdate(
      { room_id: roomId, user_id: userId },
      { $set: { last_read_at: new Date() } },
      { new: true }
    ).exec();
  }
}

export const chatRoomRepository = new ChatRoomRepository();
export const chatMessageRepository = new ChatMessageRepository();
export const chatParticipantRepository = new ChatParticipantRepository();
export default chatRoomRepository;
