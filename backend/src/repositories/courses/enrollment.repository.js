import Enrollment from "../../models/courses/enrollment.model.js";

class EnrollmentRepository {
  async findById(id) {
    return await Enrollment.findById(id).exec();
  }

  async findOne(filter) {
    return await Enrollment.findOne(filter).exec();
  }

  async findByStudentAndCourse(studentId, courseId) {
    return await Enrollment.findOne({ student_id: studentId, course_id: courseId }).exec();
  }

  async findByStudentId(studentId, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return await Enrollment.find({ student_id: studentId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findByCourseId(courseId) {
    return await Enrollment.find({ course_id: courseId }).exec();
  }

  async create(data) {
    return await Enrollment.create(data);
  }

  async updateById(id, updateData) {
    return await Enrollment.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async updateProgressById(id, progress) {
    return await Enrollment.findByIdAndUpdate(id, { $set: { progress } }, { new: true }).exec();
  }

  async updateProgress(studentId, courseId, progress) {
    return await Enrollment.findOneAndUpdate(
      { student_id: studentId, course_id: courseId },
      { $set: { progress } },
      { new: true }
    ).exec();
  }

  async deleteById(id) {
    return await Enrollment.findByIdAndDelete(id).exec();
  }

  async count(filter = {}) {
    return await Enrollment.countDocuments(filter).exec();
  }

  async countByStudentId(studentId) {
    return await Enrollment.countDocuments({ student_id: studentId }).exec();
  }
}

export default new EnrollmentRepository();
