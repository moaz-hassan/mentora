import Settings from "../../models/admin/settings.model.js";

class SettingsRepository {
  async findAllSorted() {
    return await Settings.find().sort({ category: 1, key: 1 }).exec();
  }

  async findByCategory(category) {
    return await Settings.find({ category }).sort({ key: 1 }).exec();
  }

  async findByKey(key) {
    return await Settings.findOne({ key }).exec();
  }

  async findPublic() {
    return await Settings.find({ is_public: true }).sort({ key: 1 }).exec();
  }

  async create(data) {
    return await Settings.create(data);
  }

  async updateByKey(key, updateData) {
    return await Settings.findOneAndUpdate(
      { key },
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }
}

export default new SettingsRepository();
