import enrollmentRepository from "../../repositories/courses/enrollment.repository.js";
import chapterRepository from "../../repositories/courses/chapter.repository.js";
import lessonRepository from "../../repositories/courses/lesson.repository.js";
import Quiz from "../../models/courses/quiz.model.js";
import Lesson from "../../models/courses/lesson.model.js";
import Chapter from "../../models/courses/chapter.model.js";

export const updateProgress = async (enrollmentId, studentId, progressData) => {
  const enrollment = await enrollmentRepository.findOne({
    _id: enrollmentId,
    student_id: studentId,
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  const currentProgress = enrollment.progress || {
    completedLessons: [],
    completedChapters: [],
    completedQuizzes: [],
    quizScores: {},
    completionPercentage: 0,
    lastAccessed: null,
    currentChapterId: null,
    currentLessonId: null,
    totalWatchTime: 0,
    lessonWatchTime: {},
  };

  const updatedProgress = {
    ...currentProgress,
    ...progressData,
    lastAccessed: new Date(),
  };

  if (progressData.completedLessonId) {
    if (!updatedProgress.completedLessons.includes(progressData.completedLessonId)) {
      updatedProgress.completedLessons.push(progressData.completedLessonId);
    }
  }

  if (progressData.completedChapterId) {
    if (!updatedProgress.completedChapters.includes(progressData.completedChapterId)) {
      updatedProgress.completedChapters.push(progressData.completedChapterId);
    }
  }

  if (progressData.completedQuizId) {
    if (!updatedProgress.completedQuizzes.includes(progressData.completedQuizId)) {
      updatedProgress.completedQuizzes.push(progressData.completedQuizId);
    }
    if (progressData.quizScore !== undefined) {
      updatedProgress.quizScores[progressData.completedQuizId] = progressData.quizScore;
    }
  }

  if (progressData.lessonId && progressData.watchTime) {
    updatedProgress.lessonWatchTime[progressData.lessonId] = progressData.watchTime;
    updatedProgress.totalWatchTime = Object.values(updatedProgress.lessonWatchTime).reduce(
      (sum, time) => sum + time,
      0
    );
  }

  // Recalculate completion percentage from all course chapters/lessons/quizzes
  const allChapters = await Chapter.find({ course_id: enrollment.course_id }).select("_id").exec();
  let totalItems = 0;
  let completedItems = 0;

  for (const chapter of allChapters) {
    const [lessons, quizzes] = await Promise.all([
      Lesson.find({ chapter_id: chapter._id }).select("_id").exec(),
      Quiz.find({ chapter_id: chapter._id }).select("_id").exec(),
    ]);

    totalItems += lessons.length + quizzes.length;

    lessons.forEach((lesson) => {
      if (updatedProgress.completedLessons.includes(lesson._id.toString())) {
        completedItems++;
      }
    });
    quizzes.forEach((quiz) => {
      if (updatedProgress.completedQuizzes.includes(quiz._id.toString())) {
        completedItems++;
      }
    });
  }

  updatedProgress.completionPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const updated = await enrollmentRepository.updateProgressById(enrollmentId, updatedProgress);

  return updated;
};

export const completeLesson = async (enrollmentId, lessonId, userId) => {
  const enrollment = await enrollmentRepository.findById(enrollmentId);

  if (!enrollment || enrollment.student_id !== userId) {
    const error = new Error("Enrollment not found or not authorized");
    error.statusCode = 404;
    throw error;
  }

  const lesson = await lessonRepository.findByIdRaw(lessonId);
  const chapter = await chapterRepository.findByIdRaw(lesson?.chapter_id);

  if (!lesson || !chapter || chapter.course_id !== enrollment.course_id) {
    const error = new Error("Lesson not found or does not belong to this course");
    error.statusCode = 400;
    throw error;
  }

  const progress = enrollment.progress || {
    completedLessons: [],
    completedQuizzes: [],
    completedChapters: [],
  };
  const currentCompletedLessons = [...progress.completedLessons];
  if (!currentCompletedLessons.includes(lessonId)) currentCompletedLessons.push(lessonId);

  const [chapterLessons, chapterQuizzes] = await Promise.all([
    Lesson.find({ chapter_id: chapter._id }).select("_id").exec(),
    Quiz.find({ chapter_id: chapter._id }).select("_id").exec(),
  ]);

  const allChapterLessonsCompleted = chapterLessons.every((l) =>
    currentCompletedLessons.includes(l._id.toString())
  );
  const allChapterQuizzesCompleted = chapterQuizzes.every((q) =>
    progress.completedQuizzes.includes(q._id.toString())
  );

  const progressData = {
    completedLessonId: lessonId,
    currentLessonId: lessonId,
    currentChapterId: chapter._id.toString(),
  };

  if (allChapterLessonsCompleted && allChapterQuizzesCompleted) {
    progressData.completedChapterId = chapter._id.toString();
  }

  return await updateProgress(enrollmentId, userId, progressData);
};

export default { updateProgress, completeLesson };
