import Campaign from "../../models/admin/campaign.model.js";

class CampaignRepository {
  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await Campaign.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async findById(id) {
    return await Campaign.findById(id).exec();
  }

  async create(data) {
    return await Campaign.create(data);
  }

  async updateById(id, updateData) {
    return await Campaign.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return await Campaign.findByIdAndDelete(id).exec();
  }

  async count(filter = {}) {
    return await Campaign.countDocuments(filter).exec();
  }
}

export default new CampaignRepository();
