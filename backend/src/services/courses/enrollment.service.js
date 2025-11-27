import models from "../../models/index.js";

const { Enrollment, Course, User, Chapter, Lesson, Profile, Quiz } = models;

export const getAllEnrollments = async (userId) => {
  const enrollments = await Enrollment.findAll({
    where: { student_id: userId },
    attributes: ["id", "student_id", "course_id", "enrolled_at", "progress"],
    include: [
      {
        model: Course,
        attributes: [
          "id",
          "title",
          "description",
          "category",
          "thumbnail_url",
          "createdAt",
        ],
      },
    ],
    order: [[Course, "createdAt", "DESC"]],
  });

  return enrollments;
};

export const checkEnrollment = async (courseId, studentId) => {
  const enrollment = await Enrollment.findOne({
    where: {
      course_id: courseId,
      student_id: studentId,
    },
  });

  return !!enrollment;
};

export const getEnrollmentById = async (enrollmentId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId, {
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name"],
        include: [
          {
            model: Profile,
            attributes: ["bio", "headline", "avatar_url", "social_links"],
          },
        ],
      },
      {
        model: Course,
        attributes: [
          "id",
          "title",
          "description",
          "category",
          "thumbnail_url",
          "createdAt",
        ],
        include: [
          {
            model: Chapter,
            attributes: ["id", "title", "description", "order_number"],
            include: [
              {
                model: Lesson,
                attributes: ["id", "title", "duration", "order_number"],
              },
              {
                model: Quiz,
                attributes: ["id", "title", "order_number"],
              },
            ],
          },
        ],
      },
    ],
    order: [
      [Course, Chapter, "order_number", "ASC"],
      [Course, Chapter, Lesson, "order_number", "ASC"],
      [Course, Chapter, Quiz, "order_number", "ASC"],
    ],
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  return enrollment;
};

export const createEnrollment = async (enrollmentData, studentId) => {
  const { course_id } = enrollmentData;

  const course = await Course.findByPk(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const existingEnrollment = await Enrollment.findOne({
    where: { student_id: studentId, course_id },
  });

  if (existingEnrollment) {
    const error = new Error("Already enrolled in this course");
    error.statusCode = 400;
    throw error;
  }

  if (Number(course.price) === 0.0) {
    const enrollment = await Enrollment.create({
      student_id: studentId,
      course_id,
    });
    return enrollment;
  }
};

export const completeLesson = async (enrollmentId, lessonId, userId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId);

  if (!enrollment || enrollment.student_id !== userId) {
    const error = new Error("Enrollment not found or not authorized");
    error.statusCode = 404;
    throw error;
  }

  if (typeof enrollment.progress === "string") {
    enrollment.progress = JSON.parse(enrollment.progress);
  }

  const lesson = await Lesson.findByPk(lessonId);
  const chapter = await Chapter.findByPk(lesson.chapter_id, {
    attributes: ["id", "course_id"],
    include: [
      { model: Lesson, attributes: ["id"] },
      { model: Quiz, attributes: ["id"] },
    ],
  });

  if (!lesson || chapter.course_id !== enrollment.course_id) {
    const error = new Error(
      "Lesson not found or does not belong to this course"
    );
    error.statusCode = 400;
    throw error;
  }

  const progress = {
    completedLessons: enrollment.progress?.completedLessons || [],
    completedChapters: enrollment.progress?.completedChapters || [],
    completedQuizzes: enrollment.progress?.completedQuizzes || [],
    quizScores: enrollment.progress?.quizScores || {},
    completionPercentage: enrollment.progress?.completionPercentage || 0,
  };

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);

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
      totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;
  }

  progress.lastAccessed = new Date();
  progress.currentLessonId = lessonId;
  progress.currentChapterId = chapter.id;

  await enrollment.update({ progress });
  return enrollment;
};

export const updateCurrentPosition = async (enrollmentId, lessonId, userId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId);

  if (!enrollment || enrollment.student_id !== userId) {
    const error = new Error("Enrollment not found or not authorized");
    error.statusCode = 404;
    throw error;
  }

  const lesson = await Lesson.findByPk(lessonId, {
    attributes: ["id", "chapter_id"],
  });
  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  const progress = enrollment.progress || {};
  progress.currentLessonId = lessonId;
  progress.currentChapterId = lesson.chapter_id;
  progress.lastAccessed = new Date();

  await enrollment.update({ progress });
  return enrollment;
};



/**
 * Mark lesson as completed
 */
export const markLessonComplete = async (enrollmentId, studentId, lessonId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId);

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  if (enrollment.student_id !== studentId) {
    const error = new Error("You do not have access to this enrollment");
    error.statusCode = 403;
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
  };

  // Add lesson to completed if not already there
  if (!currentProgress.completedLessons.includes(lessonId)) {
    currentProgress.completedLessons.push(lessonId);
  }

  currentProgress.lastAccessed = new Date();
  currentProgress.currentLessonId = lessonId;

  // Recalculate completion percentage
  const progressUpdate = await updateProgress(enrollmentId, studentId, currentProgress);

  return progressUpdate;
};

/**
 * Verify enrollment access for course player
 * Checks: enrollment exists, student owns it, course is published
 */
export const verifyEnrollmentAccess = async (enrollmentId, courseId, studentId) => {
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      course_id: courseId,
      student_id: studentId,
    },
    include: [
      {
        model: Course,
        attributes: ["id", "title", "is_published", "status"],
      },
    ],
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found or access denied");
    error.statusCode = 403;
    throw error;
  }

  if (!enrollment.Course.is_published) {
    const error = new Error("Course is not published");
    error.statusCode = 403;
    throw error;
  }

  if (enrollment.Course.status !== "approved") {
    const error = new Error("Course is not approved for viewing");
    error.statusCode = 403;
    throw error;
  }

  return {
    hasAccess: true,
    enrollment: enrollment,
  };
};

/**
 * Get course player data with full content access
 * Returns complete course structure with all lessons and resources
 */
export const getCoursePlayerData = async (enrollmentId, courseId, studentId) => {
  // First verify access
  await verifyEnrollmentAccess(enrollmentId, courseId, studentId);

  // Get full course data with all content
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email"],
        include: [
          {
            model: Profile,
            attributes: ["bio", "avatar_url", "headline"],
          },
        ],
      },
      {
        model: Chapter,
        where: { status: "approved" }, // Only approved chapters
        required: false,
        order: [["order_number", "ASC"]],
        include: [
          {
            model: Lesson,
            attributes: [
              "id",
              "title",
              "lesson_type",
              "video_url",
              "hls_url",
              "content",
              "duration",
              "order_number",
            ],
            include: [
              {
                model: models.LessonMaterial,
                as: "materials",
                attributes: [
                  "id",
                  "filename",
                  "url",
                  "file_type",
                  "file_size",
                  "order_number",
                ],
                order: [["order_number", "ASC"]],
              },
            ],
            order: [["order_number", "ASC"]],
          },
          {
            model: Quiz,
            attributes: ["id", "title", "description", "order_number"],
            order: [["order_number", "ASC"]],
          },
        ],
      },
    ],
  });

  // Get enrollment with progress
  const enrollment = await Enrollment.findByPk(enrollmentId);

  return {
    course: course,
    progress: enrollment.progress,
    enrollment_id: enrollmentId,
  };
};

/**
 * Update student progress
 * Updates completed lessons, chapters, quizzes, and completion percentage
 */
export const updateProgress = async (enrollmentId, studentId, progressData) => {
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  // Merge new progress data with existing
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

  // If lesson completed, add to array if not already there
  if (progressData.completedLessonId) {
    if (!updatedProgress.completedLessons.includes(progressData.completedLessonId)) {
      updatedProgress.completedLessons.push(progressData.completedLessonId);
    }
  }

  // If chapter completed, add to array
  if (progressData.completedChapterId) {
    if (!updatedProgress.completedChapters.includes(progressData.completedChapterId)) {
      updatedProgress.completedChapters.push(progressData.completedChapterId);
    }
  }

  // If quiz completed, add to array and store score
  if (progressData.completedQuizId) {
    if (!updatedProgress.completedQuizzes.includes(progressData.completedQuizId)) {
      updatedProgress.completedQuizzes.push(progressData.completedQuizId);
    }
    if (progressData.quizScore !== undefined) {
      updatedProgress.quizScores[progressData.completedQuizId] = progressData.quizScore;
    }
  }

  // Update watch time
  if (progressData.lessonId && progressData.watchTime) {
    updatedProgress.lessonWatchTime[progressData.lessonId] = progressData.watchTime;
    updatedProgress.totalWatchTime = Object.values(updatedProgress.lessonWatchTime).reduce(
      (sum, time) => sum + time,
      0
    );
  }

  // Calculate completion percentage
  const course = await Course.findByPk(enrollment.course_id, {
    include: [
      {
        model: Chapter,
        where: { status: "approved" },
        required: false,
        include: [
          {
            model: Lesson,
          },
          {
            model: Quiz,
          },
        ],
      },
    ],
  });

  let totalItems = 0;
  let completedItems = 0;

  if (course.Chapters) {
    course.Chapters.forEach((chapter) => {
      if (chapter.Lessons) {
        totalItems += chapter.Lessons.length;
        chapter.Lessons.forEach((lesson) => {
          if (updatedProgress.completedLessons.includes(lesson.id)) {
            completedItems++;
          }
        });
      }
      if (chapter.Quizzes) {
        totalItems += chapter.Quizzes.length;
        chapter.Quizzes.forEach((quiz) => {
          if (updatedProgress.completedQuizzes.includes(quiz.id)) {
            completedItems++;
          }
        });
      }
    });
  }

  updatedProgress.completionPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Update enrollment
  await enrollment.update({ progress: updatedProgress });

  return enrollment;
};

/**
 * Get student progress for an enrollment
 */
export const getProgress = async (enrollmentId, studentId) => {
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  return enrollment.progress;
};
