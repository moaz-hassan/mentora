import ErrorLog from "../../models/admin/errorLog.model.js";

class ErrorLogRepository {
  async create(data) {
    return await ErrorLog.create(data);
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await ErrorLog.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async count(filter = {}) {
    return await ErrorLog.countDocuments(filter).exec();
  }

  async aggregate(pipeline) {
    return await ErrorLog.aggregate(pipeline);
  }
}

export default new ErrorLogRepository();
