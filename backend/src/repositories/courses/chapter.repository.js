import Chapter from "../../models/courses/chapter.model.js";
import Lesson from "../../models/courses/lesson.model.js";

class ChapterRepository {
  async findByCourseId(courseId) {
    return await Chapter.find({ course_id: courseId })
      .populate({
        path: "Lessons",
        options: { sort: { order_number: 1 } },
        populate: {
          path: "materials",
          options: { sort: { order_number: 1 } },
        },
      })
      .sort({ order_number: 1 })
      .exec();
  }

  async findById(chapterId) {
    return await Chapter.findById(chapterId)
      .populate({
        path: "Lessons",
        options: { sort: { order_number: 1 } },
        populate: {
          path: "materials",
          options: { sort: { order_number: 1 } },
        },
      })
      .exec();
  }

  async findByIdRaw(chapterId) {
    return await Chapter.findById(chapterId).exec();
  }

  async findByIdWithCourse(chapterId) {
    return await Chapter.findById(chapterId).populate("Course").exec();
  }

  async findByFilter(filter = {}) {
    return await Chapter.find(filter).sort({ order_number: 1 }).exec();
  }

  async create(chapterData) {
    return await Chapter.create(chapterData);
  }

  async updateById(chapterId, updateData) {
    return await Chapter.findByIdAndUpdate(
      chapterId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteById(chapterId) {
    return await Chapter.findByIdAndDelete(chapterId).exec();
  }

  async deleteByCourseId(courseId) {
    return await Chapter.deleteMany({ course_id: courseId }).exec();
  }

  async countByCourseId(courseId) {
    return await Chapter.countDocuments({ course_id: courseId }).exec();
  }

  async findByIdWithLessonsAndQuizzes(chapterId) {
    const chapter = await Chapter.findById(chapterId)
      .populate({ path: "Lessons", select: "order_number" })
      .exec();
    if (!chapter) return null;

    const { default: Quiz } = await import("../../models/courses/quiz.model.js");
    const quizzes = await Quiz.find({ chapter_id: chapterId }).select("order_number").exec();
    chapter._quizzes = quizzes;
    return chapter;
  }
}

export default new ChapterRepository();
