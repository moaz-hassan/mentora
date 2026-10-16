import PaymentLog from "../../models/payments/paymentLog.model.js";

class PaymentLogRepository {
  async create(data) {
    return await PaymentLog.create(data);
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await PaymentLog.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async count(filter = {}) {
    return await PaymentLog.countDocuments(filter).exec();
  }

  async aggregate(pipeline) {
    return await PaymentLog.aggregate(pipeline);
  }
}

export default new PaymentLogRepository();
