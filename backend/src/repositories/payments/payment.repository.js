import Payment from "../../models/payments/payment.model.js";

class PaymentRepository {
  async findById(id) {
    return await Payment.findById(id).exec();
  }

  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await Payment.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async findOne(filter) {
    return await Payment.findOne(filter).exec();
  }

  async create(data) {
    return await Payment.create(data);
  }

  async updateById(id, updateData) {
    return await Payment.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return await Payment.findByIdAndDelete(id).exec();
  }

  async count(filter = {}) {
    return await Payment.countDocuments(filter).exec();
  }

  async aggregate(pipeline) {
    return await Payment.aggregate(pipeline);
  }
}

export default new PaymentRepository();
