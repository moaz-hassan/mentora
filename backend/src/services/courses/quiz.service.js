import models from "../../models/index.js";

const { Enrollment, Quiz, QuizResult, Course, User, Chapter, Lesson } = models;


export const getQuizById = async (quizId, studentId) => {
  const quiz = await Quiz.findByPk(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await Chapter.findByPk(quiz.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(chapter.course_id);

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await Enrollment.findOne({
    where: { student_id: studentId, course_id: course.id },
  });

  if (!enrollment) {
    const error = new Error("You are not enrolled in this course");
    error.statusCode = 403;
    throw error;
  }

  return quiz;
};

export const createQuiz = async (quizData, instructorId) => {
  const chapter = await Chapter.findByPk(quizData.chapter_id);
  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(chapter.course_id, {
    attributes: ["instructor_id"],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error(
      "You are not authorized to create a quiz for this course"
    );
    error.statusCode = 403;
    throw error;
  }

  const chapterWithItems = await Chapter.findByPk(quizData.chapter_id, {
    include: [
      { model: Lesson, attributes: ["order_number"] },
      { model: Quiz, attributes: ["id", "order_number"] },
    ],
  });

  const usedOrders = new Set([
    ...chapterWithItems.Lessons.map((l) => Number(l.order_number)).filter((n) => Number.isFinite(n) && n > 0),
    ...chapterWithItems.Quizzes.map((q) => Number(q.order_number)).filter((n) => Number.isFinite(n) && n > 0),
  ]);

  let desired = Number(quizData.order_number);
  if (!Number.isFinite(desired) || desired < 1) desired = 1;
  while (usedOrders.has(desired)) desired += 1;
  quizData.order_number = desired;

  const quiz = await Quiz.create(quizData);

  return quiz;
};

export const updateQuiz = async (quizId, updateData, instructorId) => {
  const quiz = await Quiz.findByPk(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await Chapter.findByPk(quiz.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(chapter.course_id, {
    attributes: ["instructor_id"],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error(
      "You are not authorized to update this quiz"
    );
    error.statusCode = 403;
    throw error;
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "order_number")) {
    const chapterWithItems = await Chapter.findByPk(quiz.chapter_id, {
      include: [
        { model: Lesson, attributes: ["order_number"] },
        { model: Quiz, attributes: ["id", "order_number"] },
      ],
    });

    const usedOrders = new Set([
      ...chapterWithItems.Lessons.map((l) => Number(l.order_number)).filter((n) => Number.isFinite(n) && n > 0),
      ...chapterWithItems.Quizzes.filter((q) => q.id !== quiz.id).map((q) => Number(q.order_number)).filter((n) => Number.isFinite(n) && n > 0),
    ]);

    let desired = Number(updateData.order_number);
    if (!Number.isFinite(desired) || desired < 1) desired = 1;
    while (usedOrders.has(desired)) desired += 1;
    updateData.order_number = desired;
  }

  await quiz.update(updateData);

  return quiz;
};

export const deleteQuiz = async (quizId, instructorId) => {
  const quiz = await Quiz.findByPk(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await Chapter.findByPk(quiz.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(chapter.course_id, {
    attributes: ["instructor_id"],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error(
      "You are not authorized to delete this quiz"
    );
    error.statusCode = 403;
    throw error;
  }

  await quiz.destroy();

  return { message: "Quiz deleted successfully" };
};

export const submitQuizResult = async (resultData, studentId) => {
  const { quiz_id, score } = resultData;

  // Verify quiz exists
  const quiz = await Quiz.findByPk(quiz_id);
  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }
  
  const chapter = await Chapter.findByPk(quiz.chapter_id, {
    attributes: ["id", "course_id"],
    include: [
      { model: Lesson, attributes: ["id"] },
      { model: Quiz, attributes: ["id"] },
    ],
  });

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await Enrollment.findOne({
    where: { student_id: studentId, course_id: chapter.course_id },
  });

  if (!enrollment) {
    const error = new Error("You are not enrolled in this course");
    error.statusCode = 403;
    throw error;
  }

  const result = await QuizResult.create({
    quiz_id,
    student_id: studentId,
    score,
  });
  
  if (typeof enrollment.progress === "string") {
    enrollment.progress = JSON.parse(enrollment.progress);
  }

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

  const allChapterLessonsCompleted = chapter.Lessons.every((l) =>
    progress.completedLessons.includes(l.id)
  );
  const allChapterQuizzesCompleted = (chapter.Quizzes || []).every((q) =>
    progress.completedQuizzes.includes(q.id)
  );
  if (
    allChapterLessonsCompleted &&
    allChapterQuizzesCompleted &&
    !progress.completedChapters.includes(chapter.id)
  ) {
    progress.completedChapters.push(chapter.id);
  }
  
  const course = await Course.findByPk(enrollment.course_id, {
    include: [{ model: Chapter, include: [Lesson, Quiz] }],
  });

  const totalLessons = course.Chapters.reduce(
    (count, ch) => count + ch.Lessons.length,
    0
  );
  const totalQuizzes = course.Chapters.reduce(
    (count, ch) => count + (ch.Quizzes?.length || 0),
    0
  );
  const totalItems = totalLessons + totalQuizzes;
  const completedItems =
    progress.completedLessons.length + progress.completedQuizzes.length;

  progress.completionPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  await enrollment.update({ progress });

  return result;
};

export const getQuizResultsByStudent = async (studentId) => {
  const results = await QuizResult.findAll({
    where: { student_id: studentId },
    include: [
      {
        model: Quiz,
        include: [{ model: Chapter, include: [{ model: Course, attributes: ["id", "title"] }] }],
      },
    ],
  });

  return results;
};

export const getQuizResultsByQuiz = async (quizId) => {
  const results = await QuizResult.findAll({
    where: { quiz_id: quizId },
    include: [{ model: User, attributes: ["id", "full_name", "email"] }],
  });

  return results;
};
