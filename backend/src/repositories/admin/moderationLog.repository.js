import ModerationLog from "../../models/admin/moderationLog.model.js";

class ModerationLogRepository {
  async create(data) {
    return await ModerationLog.create(data);
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await ModerationLog.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async count(filter = {}) {
    return await ModerationLog.countDocuments(filter).exec();
  }
}

export default new ModerationLogRepository();
