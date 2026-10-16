import Settings from "../../models/admin/settings.model.js";

class SettingsRepository {
  async getSettings() {
    return await Settings.findOne().exec();
  }

  async updateSettings(updateData) {
    return await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }
}

export default new SettingsRepository();
