import { quizRepository, quizResultRepository } from "../../repositories/courses/quiz.repository.js";
import chapterRepository from "../../repositories/courses/chapter.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";
import enrollmentRepository from "../../repositories/courses/enrollment.repository.js";
import Course from "../../models/courses/course.model.js";
import Chapter from "../../models/courses/chapter.model.js";
import Lesson from "../../models/courses/lesson.model.js";
import Quiz from "../../models/courses/quiz.model.js";

export const getQuizById = async (quizId, studentId) => {
  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(quiz.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, chapter.course_id);

  if (!enrollment) {
    const error = new Error("You are not enrolled in this course");
    error.statusCode = 403;
    throw error;
  }

  return quiz;
};

export const createQuiz = async (quizData, instructorId) => {
  const chapter = await chapterRepository.findByIdRaw(quizData.chapter_id);
  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to create a quiz for this course");
    error.statusCode = 403;
    throw error;
  }

  // Resolve order_number: avoid conflicts with existing lessons and quizzes
  const [existingLessons, existingQuizzes] = await Promise.all([
    Lesson.find({ chapter_id: quizData.chapter_id }).select("order_number").exec(),
    Quiz.find({ chapter_id: quizData.chapter_id }).select("order_number").exec(),
  ]);

  const usedOrders = new Set([
    ...existingLessons.map((l) => Number(l.order_number)).filter((n) => Number.isFinite(n) && n > 0),
    ...existingQuizzes.map((q) => Number(q.order_number)).filter((n) => Number.isFinite(n) && n > 0),
  ]);

  let desired = Number(quizData.order_number);
  if (!Number.isFinite(desired) || desired < 1) desired = 1;
  while (usedOrders.has(desired)) desired += 1;
  quizData.order_number = desired;

  return await quizRepository.create(quizData);
};

export const updateQuiz = async (quizId, updateData, instructorId) => {
  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(quiz.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to update this quiz");
    error.statusCode = 403;
    throw error;
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "order_number")) {
    const [existingLessons, existingQuizzes] = await Promise.all([
      Lesson.find({ chapter_id: quiz.chapter_id }).select("order_number").exec(),
      Quiz.find({ chapter_id: quiz.chapter_id }).select("order_number").exec(),
    ]);

    const usedOrders = new Set([
      ...existingLessons.map((l) => Number(l.order_number)).filter((n) => Number.isFinite(n) && n > 0),
      ...existingQuizzes.filter((q) => q._id.toString() !== quizId).map((q) => Number(q.order_number)).filter((n) => Number.isFinite(n) && n > 0),
    ]);

    let desired = Number(updateData.order_number);
    if (!Number.isFinite(desired) || desired < 1) desired = 1;
    while (usedOrders.has(desired)) desired += 1;
    updateData.order_number = desired;
  }

  return await quizRepository.updateById(quizId, updateData);
};

export const deleteQuiz = async (quizId, instructorId) => {
  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(quiz.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to delete this quiz");
    error.statusCode = 403;
    throw error;
  }

  await quizRepository.deleteById(quizId);

  return { message: "Quiz deleted successfully" };
};

export const submitQuizResult = async (resultData, studentId) => {
  const { quiz_id, score } = resultData;

  const quiz = await quizRepository.findById(quiz_id);
  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(quiz.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, chapter.course_id);

  if (!enrollment) {
    const error = new Error("You are not enrolled in this course");
    error.statusCode = 403;
    throw error;
  }

  const result = await quizResultRepository.create({
    quiz_id,
    student_id: studentId,
    score,
  });

  const progress = {
    completedLessons: enrollment.progress?.completedLessons || [],
    completedChapters: enrollment.progress?.completedChapters || [],
    completedQuizzes: enrollment.progress?.completedQuizzes || [],
    quizScores: enrollment.progress?.quizScores || {},
    completionPercentage: enrollment.progress?.completionPercentage || 0,
  };

  const prev = Number(progress.quizScores[quiz_id] || 0);
  const incoming = Number(score);
  const best = Number.isFinite(incoming) ? Math.max(prev, incoming) : prev;
  progress.quizScores[quiz_id] = best;

  if (best >= Number(process.env.QUIZ_PASS_THRESHOLD) && !progress.completedQuizzes.includes(quiz_id)) {
    progress.completedQuizzes.push(quiz_id);
  }

  // Check if chapter is completed
  const [chapterLessons, chapterQuizzes] = await Promise.all([
    Lesson.find({ chapter_id: chapter._id }).select("_id").exec(),
    Quiz.find({ chapter_id: chapter._id }).select("_id").exec(),
  ]);

  const allChapterLessonsCompleted = chapterLessons.every((l) =>
    progress.completedLessons.includes(l._id.toString())
  );
  const allChapterQuizzesCompleted = chapterQuizzes.every((q) =>
    progress.completedQuizzes.includes(q._id.toString())
  );

  if (
    allChapterLessonsCompleted &&
    allChapterQuizzesCompleted &&
    !progress.completedChapters.includes(chapter._id.toString())
  ) {
    progress.completedChapters.push(chapter._id.toString());
  }

  // Compute overall course completion percentage
  const allChapters = await Chapter.find({ course_id: enrollment.course_id }).select("_id").exec();
  let totalLessons = 0;
  let totalQuizzes = 0;
  for (const ch of allChapters) {
    const [lCount, qCount] = await Promise.all([
      Lesson.countDocuments({ chapter_id: ch._id }),
      Quiz.countDocuments({ chapter_id: ch._id }),
    ]);
    totalLessons += lCount;
    totalQuizzes += qCount;
  }

  const totalItems = totalLessons + totalQuizzes;
  const completedItems = progress.completedLessons.length + progress.completedQuizzes.length;
  progress.completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  await enrollmentRepository.updateProgressById(enrollment._id.toString(), progress);

  return result;
};

export const getQuizResultsByStudent = async (studentId) => {
  return await quizResultRepository.findByStudentId(studentId);
};

export const getQuizResultsByQuiz = async (quizId) => {
  return await quizResultRepository.findByQuizId(quizId);
};

export default {
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizResult,
  getQuizResultsByStudent,
  getQuizResultsByQuiz,
};
