import Profile from "../../models/auth/profile.model.js";

class ProfileRepository {
  async findByUserId(userId) {
    return await Profile.findOne({ user_id: userId }).exec();
  }

  async create(profileData) {
    return await Profile.create(profileData);
  }

  async updateByUserId(userId, updateData) {
    return await Profile.findOneAndUpdate(
      { user_id: userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async deleteByUserId(userId) {
    return await Profile.findOneAndDelete({ user_id: userId }).exec();
  }
}

export default new ProfileRepository();
