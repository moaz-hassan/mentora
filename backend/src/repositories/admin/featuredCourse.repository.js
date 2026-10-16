import FeaturedCourse from "../../models/admin/featuredCourse.model.js";

class FeaturedCourseRepository {
  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { display_order: 1 } } = options;
    return await FeaturedCourse.find(filter).sort(sort).skip(skip).limit(limit).exec();
  }

  async findById(id) {
    return await FeaturedCourse.findById(id).exec();
  }

  async findOne(filter) {
    return await FeaturedCourse.findOne(filter).exec();
  }

  async create(data) {
    return await FeaturedCourse.create(data);
  }

  async updateById(id, updateData) {
    return await FeaturedCourse.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return await FeaturedCourse.findByIdAndDelete(id).exec();
  }

  async deleteMany(filter) {
    return await FeaturedCourse.deleteMany(filter).exec();
  }
}

export default new FeaturedCourseRepository();
