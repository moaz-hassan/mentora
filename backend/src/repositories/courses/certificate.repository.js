import Certificate from "../../models/courses/certificate.model.js";

class CertificateRepository {
  async findById(id) {
    return await Certificate.findById(id).exec();
  }

  async findByStudentAndCourse(studentId, courseId) {
    return await Certificate.findOne({ student_id: studentId, course_id: courseId }).exec();
  }

  async findAll(filter = {}) {
    return await Certificate.find(filter).sort({ issued_at: -1 }).exec();
  }

  async create(data) {
    return await Certificate.create(data);
  }

  async updateById(id, updateData) {
    return await Certificate.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return await Certificate.findByIdAndDelete(id).exec();
  }
}

export default new CertificateRepository();
