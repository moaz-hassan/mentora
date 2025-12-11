import models from "../../models/index.js";

const { Enrollment, Course, Chapter, Lesson, Quiz } = models;


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
    if (
      !updatedProgress.completedLessons.includes(progressData.completedLessonId)
    ) {
      updatedProgress.completedLessons.push(progressData.completedLessonId);
    }
  }

  
  if (progressData.completedChapterId) {
    if (
      !updatedProgress.completedChapters.includes(
        progressData.completedChapterId
      )
    ) {
      updatedProgress.completedChapters.push(progressData.completedChapterId);
    }
  }

  
  if (progressData.completedQuizId) {
    if (
      !updatedProgress.completedQuizzes.includes(progressData.completedQuizId)
    ) {
      updatedProgress.completedQuizzes.push(progressData.completedQuizId);
    }
    if (progressData.quizScore !== undefined) {
      updatedProgress.quizScores[progressData.completedQuizId] =
        progressData.quizScore;
    }
  }

  
  if (progressData.lessonId && progressData.watchTime) {
    updatedProgress.lessonWatchTime[progressData.lessonId] =
      progressData.watchTime;
    updatedProgress.totalWatchTime = Object.values(
      updatedProgress.lessonWatchTime
    ).reduce((sum, time) => sum + time, 0);
  }

  
  const course = await Course.findByPk(enrollment.course_id, {
    include: [
      {
        model: Chapter,
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

  
  await enrollment.update({ progress: updatedProgress });

  return enrollment;
};


export const completeLesson = async (enrollmentId, lessonId, userId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId);

  if (!enrollment || enrollment.student_id !== userId) {
    const error = new Error("Enrollment not found or not authorized");
    error.statusCode = 404;
    throw error;
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
    const error = new Error("Lesson not found or does not belong to this course");
    error.statusCode = 400;
    throw error;
  }

  
  const progress = enrollment.progress || { completedLessons: [], completedQuizzes: [], completedChapters: [] };
  const currentCompletedLessons = [...progress.completedLessons];
  if(!currentCompletedLessons.includes(lessonId)) currentCompletedLessons.push(lessonId);

  const allChapterLessonsCompleted = chapter.Lessons.every((l) =>
      currentCompletedLessons.includes(l.id)
  );
  const allChapterQuizzesCompleted = (chapter.Quizzes || []).every((q) =>
      progress.completedQuizzes.includes(q.id)
  );

  const progressData = {
      completedLessonId: lessonId,
      currentLessonId: lessonId,
      currentChapterId: chapter.id
  };

  if (allChapterLessonsCompleted && allChapterQuizzesCompleted) {
      progressData.completedChapterId = chapter.id;
  }

  return await updateProgress(enrollmentId, userId, progressData);
};
