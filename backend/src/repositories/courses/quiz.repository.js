import Quiz from "../../models/courses/quiz.model.js";
import QuizResult from "../../models/courses/quizResult.model.js";

class QuizRepository {
  async findById(id) {
    return await Quiz.findById(id).exec();
  }

  async findByChapterId(chapterId) {
    return await Quiz.find({ chapter_id: chapterId }).sort({ order_number: 1 }).exec();
  }

  async create(data) {
    return await Quiz.create(data);
  }

  async updateById(id, updateData) {
    return await Quiz.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return await Quiz.findByIdAndDelete(id).exec();
  }

  async countByChapterId(chapterId) {
    return await Quiz.countDocuments({ chapter_id: chapterId }).exec();
  }
}

class QuizResultRepository {
  async create(data) {
    return await QuizResult.create(data);
  }

  async findByStudentId(studentId) {
    return await QuizResult.find({ student_id: studentId }).sort({ createdAt: -1 }).exec();
  }

  async findByQuizId(quizId) {
    return await QuizResult.find({ quiz_id: quizId }).exec();
  }

  async findByStudentAndQuiz(studentId, quizId) {
    return await QuizResult.findOne({ student_id: studentId, quiz_id: quizId }).exec();
  }
}

export const quizRepository = new QuizRepository();
export const quizResultRepository = new QuizResultRepository();
export default quizRepository;
