import Ratings from "../../models/courses/Ratings.model.js";

class RatingRepository {
  async findById(id) {
    return await Ratings.findById(id).exec();
  }

  async findByStudentAndCourse(studentId, courseId) {
    return await Ratings.findOne({ student_id: studentId, course_id: courseId }).exec();
  }

  async findByStudent(studentId) {
    return await Ratings.find({ student_id: studentId }).sort({ createdAt: -1 }).exec();
  }

  async findByCourse(courseId) {
    return await Ratings.find({ course_id: courseId }).sort({ createdAt: -1 }).exec();
  }

  async create(data) {
    return await Ratings.create(data);
  }

  async updateById(id, updateData) {
    return await Ratings.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return await Ratings.findByIdAndDelete(id).exec();
  }

  async getAverageRatingForCourse(courseId) {
    const result = await Ratings.aggregate([
      { $match: { course_id: courseId } },
      {
        $group: {
          _id: "$course_id",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    return result[0] || { averageRating: null, totalReviews: 0 };
  }
}

export default new RatingRepository();
