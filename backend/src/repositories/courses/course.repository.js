import Course from "../../models/courses/course.model.js";

class CourseRepository {
  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await Course.find(filter)
      .populate("Instructor", "id first_name last_name email")
      .populate({
        path: "Chapters",
        options: { sort: { order_number: 1 } },
        populate: {
          path: "Lessons",
          options: { sort: { order_number: 1 } },
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findById(courseId) {
    return await Course.findById(courseId)
      .populate("Instructor", "id first_name last_name email")
      .populate({
        path: "Chapters",
        options: { sort: { order_number: 1 } },
        populate: {
          path: "Lessons",
          options: { sort: { order_number: 1 } },
          populate: {
            path: "materials",
            options: { sort: { order_number: 1 } },
          },
        },
      })
      .exec();
  }

  async searchCourses(searchTerm, filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = {} } = options;

    try {
      const textFilter = {
        ...filter,
        $text: { $search: searchTerm },
      };

      const results = await Course.find(textFilter, {
        score: { $meta: "textScore" },
      })
        .populate("Instructor", "id first_name last_name")
        .sort({ score: { $meta: "textScore" }, ...sort })
        .skip(skip)
        .limit(limit)
        .exec();

      if (results && results.length > 0) {
        return results;
      }
    } catch (textErr) {
      // Fallback to regex if text index is building
    }

    const regex = new RegExp(searchTerm.trim(), "i");
    const regexFilter = {
      ...filter,
      $or: [
        { title: regex },
        { subtitle: regex },
        { description: regex },
        { category: regex },
      ],
    };

    return await Course.find(regexFilter)
      .populate("Instructor", "id first_name last_name")
      .sort(sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter = {}) {
    return await Course.countDocuments(filter).exec();
  }

  async create(courseData) {
    return await Course.create(courseData);
  }

  async updateById(courseId, updateData) {
    return await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("Instructor", "id first_name last_name")
      .exec();
  }

  async deleteById(courseId) {
    return await Course.findByIdAndDelete(courseId).exec();
  }

  async countByCategory(categoryIdentifier) {
    return await Course.countDocuments({
      $or: [{ category: categoryIdentifier }, { category_id: categoryIdentifier }],
    }).exec();
  }

  async countBySubCategory(subCategoryIdentifier) {
    return await Course.countDocuments({
      $or: [
        { subcategory: subCategoryIdentifier },
        { subcategory_id: subCategoryIdentifier },
      ],
    }).exec();
  }
}

export default new CourseRepository();
