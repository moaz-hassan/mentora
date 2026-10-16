import User from "../../models/auth/user.model.js";

class UserRepository {
  async findByEmail(email, selectPassword = false) {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (selectPassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  async findById(id, selectPassword = false) {
    const query = User.findById(id);
    if (!selectPassword) {
      query.select("-password");
    }
    return await query.exec();
  }

  async create(userData) {
    return await User.create(userData);
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password").exec();
  }

  async updatePassword(id, hashedPassword) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true }
    ).exec();
  }

  async markEmailVerified(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { is_email_verified: true } },
      { new: true }
    ).exec();
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    return await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter = {}) {
    return await User.countDocuments(filter).exec();
  }

  async deleteById(id) {
    return await User.findByIdAndDelete(id).exec();
  }
}

export default new UserRepository();
