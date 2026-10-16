import Coupon from "../../models/payments/coupon.model.js";

class CouponRepository {
  async findById(id) {
    return await Coupon.findById(id).exec();
  }

  async findAll(filter = {}) {
    return await Coupon.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(filter) {
    return await Coupon.findOne(filter).exec();
  }

  async create(data) {
    return await Coupon.create(data);
  }

  async updateById(id, updateData) {
    return await Coupon.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return await Coupon.findByIdAndDelete(id).exec();
  }

  async updateManyByFilter(filter, updateData) {
    return await Coupon.updateMany(filter, { $set: updateData }).exec();
  }

  async findByCourseId(courseId) {
    return await Coupon.find({ course_id: courseId }).exec();
  }

  async findActiveCoupon(code, courseId) {
    const now = new Date();
    const courseSpecific = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      is_active: true,
      course_id: courseId,
      discount_start_date: { $lte: now },
      discount_end_date: { $gte: now },
    }).exec();
    if (courseSpecific) return courseSpecific;

    return await Coupon.findOne({
      code: code.toUpperCase().trim(),
      is_active: true,
      is_global: true,
      discount_start_date: { $lte: now },
      discount_end_date: { $gte: now },
    }).exec();
  }

  async findActiveGlobalCoupon() {
    const now = new Date();
    return await Coupon.findOne({
      is_global: true,
      is_active: true,
      discount_start_date: { $lte: now },
      discount_end_date: { $gte: now },
    }).exec();
  }

  async findExpiredActive() {
    return await Coupon.find({
      is_active: true,
      discount_end_date: { $lt: new Date() },
    }).exec();
  }

  async searchByCode(searchTerm) {
    return await Coupon.find({
      code: { $regex: searchTerm, $options: "i" },
    }).sort({ createdAt: -1 }).exec();
  }
}

export default new CouponRepository();
