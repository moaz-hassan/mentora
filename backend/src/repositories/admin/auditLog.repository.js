import AuditLog from "../../models/admin/auditLog.model.js";

class AuditLogRepository {
  async create(data) {
    return await AuditLog.create(data);
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await AuditLog.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async count(filter = {}) {
    return await AuditLog.countDocuments(filter).exec();
  }

  async aggregate(pipeline) {
    return await AuditLog.aggregate(pipeline);
  }
}

export default new AuditLogRepository();
