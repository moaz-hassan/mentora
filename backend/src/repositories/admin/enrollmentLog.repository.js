import EnrollmentLog from "../../models/admin/enrollmentLog.model.js";

class EnrollmentLogRepository {
  async create(data) {
    return await EnrollmentLog.create(data);
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await EnrollmentLog.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async count(filter = {}) {
    return await EnrollmentLog.countDocuments(filter).exec();
  }

  async aggregate(pipeline) {
    return await EnrollmentLog.aggregate(pipeline);
  }
}

export default new EnrollmentLogRepository();
