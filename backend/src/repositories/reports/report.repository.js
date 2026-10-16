import Report from "../../models/reports/report.model.js";

class ReportRepository {
  async create(data) {
    return await Report.create(data);
  }

  async findById(id) {
    return await Report.findById(id).exec();
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await Report.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async updateById(id, updateData) {
    return await Report.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async count(filter = {}) {
    return await Report.countDocuments(filter).exec();
  }

  async deleteById(id) {
    return await Report.findByIdAndDelete(id).exec();
  }
}

export default new ReportRepository();
