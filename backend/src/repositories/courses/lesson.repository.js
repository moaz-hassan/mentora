import Lesson from "../../models/courses/lesson.model.js";
import LessonMaterial from "../../models/courses/lessonMaterial.model.js";

class LessonRepository {
  async findByChapterId(chapterId) {
    return await Lesson.find({ chapter_id: chapterId })
      .populate("materials")
      .sort({ order_number: 1 })
      .exec();
  }

  async findById(lessonId) {
    return await Lesson.findById(lessonId)
      .populate("materials")
      .exec();
  }

  async findByIdRaw(lessonId) {
    return await Lesson.findById(lessonId).exec();
  }

  async create(lessonData) {
    return await Lesson.create(lessonData);
  }

  async updateById(lessonId, updateData) {
    return await Lesson.findByIdAndUpdate(
      lessonId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteById(lessonId) {
    return await Lesson.findByIdAndDelete(lessonId).exec();
  }

  async deleteByChapterId(chapterId) {
    return await Lesson.deleteMany({ chapter_id: chapterId }).exec();
  }

  async countByChapterId(chapterId) {
    return await Lesson.countDocuments({ chapter_id: chapterId }).exec();
  }

  async bulkCreateMaterials(materialsData) {
    return await LessonMaterial.insertMany(materialsData);
  }
}

export default new LessonRepository();
