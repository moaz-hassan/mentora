/**
 * Instructor Service
 * Purpose: Handle instructor-specific operations including analytics
 */

import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";
import { sequelize } from "../../config/db.js";

const {
  Course,
  Enrollment,
  Payment,
  CourseReview,
  Lesson,
  Quiz,
  QuizResult,
  ChatMessage,
  ChatRoom,
  Chapter,
} = models;

export const getComprehensiveAnalytics = async (instructorId, courseId = null, days = 30) => {
  try {
    // Get approved courses for instructor
    const courseFilter = {
      instructor_id: instructorId,
      status: "approved",
    };

    if (courseId) {
      courseFilter.id = courseId;
    }

    const courses = await Course.findAll({
      where: courseFilter,
      attributes: ["id", "title"],
    });

  if (courses.length === 0) {
    return {
      overview: {
        totalEnrollments: 0,
        activeStudents: 0,
        completionRate: 0,
        averageRating: 0,
        totalRevenue: 0,
        averageWatchTime: 0,
      },
      courses: [],
      enrollmentTrend: [],
      lessonAnalytics: [],
      quizAnalytics: {
        averageScore: 0,
        passRate: 0,
        totalAttempts: 0,
        mostMissedQuestions: [],
      },
      engagement: {
        chatParticipation: 0,
        averageSessionDuration: 0,
        activeStudentsPerDay: [],
      },
    };
  }

  const courseIds = courses.map((c) => c.id);

  // Get all analytics data in parallel
  const [
    overview,
    coursesPerformance,
    enrollmentTrend,
    lessonAnalytics,
    quizAnalytics,
    engagement,
  ] = await Promise.all([
    getOverviewStats(courseIds),
    getCoursesPerformance(courses),
    getEnrollmentTrend(courseIds, days),
    getLessonAnalytics(courseIds),
    getQuizAnalytics(courseIds),
    getEngagementMetrics(courseIds, days),
  ]);

    return {
      overview,
      courses: coursesPerformance,
      enrollmentTrend,
      lessonAnalytics,
      quizAnalytics,
      engagement,
    };
  } catch (error) {
    console.error("Error in getComprehensiveAnalytics:", error);
    throw error;
  }
};


const getOverviewStats = async (courseIds) => {
  // Get all enrollments
  const enrollments = await Enrollment.findAll({
    where: { course_id: courseIds },
    attributes: ["id", "progress"],
  });

  const totalEnrollments = enrollments.length;

  // Calculate active students (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let activeStudents = 0;
  let completedCount = 0;
  let totalWatchTime = 0;
  let studentsWithWatchTime = 0;

  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};

    // Active students
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : null;
    if (lastAccessed && lastAccessed >= thirtyDaysAgo) {
      activeStudents++;
    }

    // Completed courses
    if (progress.completionPercentage === 100) {
      completedCount++;
    }

    // Watch time
    if (progress.totalWatchTime && progress.totalWatchTime > 0) {
      totalWatchTime += progress.totalWatchTime;
      studentsWithWatchTime++;
    }
  });

  // Completion rate
  const completionRate =
    totalEnrollments > 0
      ? parseFloat(((completedCount / totalEnrollments) * 100).toFixed(1))
      : 0;

  // Average rating
  const ratingResult = await CourseReview.findOne({
    where: { course_id: courseIds },
    attributes: [
      [fn("AVG", col("rating")), "avgRating"],
    ],
    raw: true,
  });

  const averageRating = ratingResult?.avgRating
    ? parseFloat(parseFloat(ratingResult.avgRating).toFixed(1))
    : 0;

  // Total revenue
  const totalRevenue = await Payment.sum("amount", {
    where: {
      course_id: courseIds,
      status: "completed",
    },
  });

  // Average watch time in hours
  const averageWatchTime =
    studentsWithWatchTime > 0
      ? parseFloat((totalWatchTime / studentsWithWatchTime / 3600).toFixed(1))
      : 0;

  return {
    totalEnrollments,
    activeStudents,
    completionRate,
    averageRating,
    totalRevenue: parseFloat((totalRevenue || 0).toFixed(2)),
    averageWatchTime,
  };
};

/**
 * Get performance data for each course
 */
const getCoursesPerformance = async (courses) => {
  const coursesPerformance = await Promise.all(
    courses.map(async (course) => {
      // Get enrollments for this course
      const enrollments = await Enrollment.findAll({
        where: { course_id: course.id },
        attributes: ["id", "progress"],
      });

      const totalEnrollments = enrollments.length;

      // Calculate metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let activeStudents = 0;
      let completedCount = 0;

      enrollments.forEach((enrollment) => {
        const progress = enrollment.progress || {};

        const lastAccessed = progress.lastAccessed
          ? new Date(progress.lastAccessed)
          : null;
        if (lastAccessed && lastAccessed >= thirtyDaysAgo) {
          activeStudents++;
        }

        if (progress.completionPercentage === 100) {
          completedCount++;
        }
      });

      const completionRate =
        totalEnrollments > 0
          ? parseFloat(((completedCount / totalEnrollments) * 100).toFixed(1))
          : 0;

      // Average rating
      const ratingResult = await CourseReview.findOne({
        where: { course_id: course.id },
        attributes: [
          [
            fn("AVG", col("rating")),
            "avgRating",
          ],
        ],
        raw: true,
      });

      const averageRating = ratingResult?.avgRating
        ? parseFloat(parseFloat(ratingResult.avgRating).toFixed(1))
        : 0;

      // Revenue
      const revenue = await Payment.sum("amount", {
        where: {
          course_id: course.id,
          status: "completed",
        },
      });

      return {
        id: course.id,
        title: course.title,
        enrollments: totalEnrollments,
        activeStudents,
        completionRate,
        averageRating,
        revenue: parseFloat((revenue || 0).toFixed(2)),
      };
    })
  );

  return coursesPerformance;
};

/**
 * Get enrollment trend over time
 */
const getEnrollmentTrend = async (courseIds, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const enrollments = await Enrollment.findAll({
    where: {
      course_id: courseIds,
      enrolled_at: { [Op.gte]: startDate },
    },
    attributes: ["enrolled_at"],
    order: [["enrolled_at", "ASC"]],
  });

  // Group by week
  const weeklyData = {};
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;

  enrollments.forEach((enrollment) => {
    const enrollDate = new Date(enrollment.enrolled_at);
    const weeksDiff = Math.floor((enrollDate - startDate) / msPerWeek);
    const weekKey = `Week ${weeksDiff + 1}`;

    weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
  });

  // Convert to array format
  const trend = Object.entries(weeklyData).map(([date, enrollments]) => ({
    date,
    enrollments,
  }));

  return trend;
};

/**
 * Get lesson-level analytics
 */
const getLessonAnalytics = async (courseIds) => {
  // Get all lessons for the courses
  const lessons = await Lesson.findAll({
    include: [
      {
        model: Chapter,
        where: { course_id: courseIds },
        attributes: [],
        required: true,
      },
    ],
    attributes: ["id", "title", "duration"],
  });

  if (lessons.length === 0) {
    return [];
  }

  // Get all enrollments
  const enrollments = await Enrollment.findAll({
    where: { course_id: courseIds },
    attributes: ["progress"],
  });

  const totalEnrollments = enrollments.length;

  // Calculate analytics for each lesson
  const lessonAnalytics = lessons.map((lesson) => {
    let views = 0;
    let totalWatchTime = 0;
    let watchTimeCount = 0;

    enrollments.forEach((enrollment) => {
      const progress = enrollment.progress || {};

      // Check if lesson was completed (viewed)
      if (progress.completedLessons?.includes(lesson.id)) {
        views++;
      }

      // Get watch time for this lesson
      const lessonWatchTime = progress.lessonWatchTime?.[lesson.id];
      if (lessonWatchTime && lessonWatchTime > 0) {
        totalWatchTime += lessonWatchTime;
        watchTimeCount++;
      }
    });

    const avgWatchTime =
      watchTimeCount > 0
        ? parseFloat((totalWatchTime / watchTimeCount / 60).toFixed(1))
        : 0;

    const completionRate =
      totalEnrollments > 0
        ? parseFloat(((views / totalEnrollments) * 100).toFixed(1))
        : 0;

    const dropOffRate = parseFloat((100 - completionRate).toFixed(1));

    return {
      id: lesson.id,
      title: lesson.title,
      views,
      avgWatchTime,
      completionRate,
      dropOffRate,
    };
  });

  return lessonAnalytics;
};

/**
 * Get quiz analytics
 */
const getQuizAnalytics = async (courseIds) => {
  // Get all quizzes for the courses
  const quizzes = await Quiz.findAll({
    include: [
      {
        model: Chapter,
        where: { course_id: courseIds },
        attributes: [],
        required: true,
      },
    ],
    attributes: ["id", "questions"],
  });

  if (quizzes.length === 0) {
    return {
      averageScore: 0,
      passRate: 0,
      totalAttempts: 0,
      mostMissedQuestions: [],
    };
  }

  const quizIds = quizzes.map((q) => q.id);

  // Get all quiz results
  const quizResults = await QuizResult.findAll({
    where: { quiz_id: quizIds },
    attributes: ["score", "answers", "quiz_id"],
  });

  const totalAttempts = quizResults.length;

  if (totalAttempts === 0) {
    return {
      averageScore: 0,
      passRate: 0,
      totalAttempts: 0,
      mostMissedQuestions: [],
    };
  }

  // Calculate average score
  const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
  const averageScore = parseFloat((totalScore / totalAttempts).toFixed(1));

  // Calculate pass rate (assuming 60% is passing)
  const passCount = quizResults.filter((result) => result.score >= 60).length;
  const passRate = parseFloat(((passCount / totalAttempts) * 100).toFixed(1));

  // Analyze most missed questions
  const questionStats = {};

  // Initialize question stats
  quizzes.forEach((quiz) => {
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach((q) => {
        if (q.id && q.question) {
          questionStats[q.id] = {
            question: q.question,
            total: 0,
            missed: 0,
          };
        }
      });
    }
  });

  // Count correct and incorrect answers
  quizResults.forEach((result) => {
    if (result.answers && Array.isArray(result.answers)) {
      result.answers.forEach((answer) => {
        if (questionStats[answer.id]) {
          questionStats[answer.id].total++;
          if (!answer.isCorrect) {
            questionStats[answer.id].missed++;
          }
        }
      });
    }
  });

  // Calculate miss rates and get top 5
  const mostMissedQuestions = Object.values(questionStats)
    .filter((stat) => stat.total > 0)
    .map((stat) => ({
      question: stat.question,
      missRate: parseFloat(((stat.missed / stat.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 5);

  return {
    averageScore,
    passRate,
    totalAttempts,
    mostMissedQuestions,
  };
};

/**
 * Get student engagement metrics
 */
const getEngagementMetrics = async (courseIds, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all enrollments
  const enrollments = await Enrollment.findAll({
    where: { course_id: courseIds },
    attributes: ["progress"],
  });

  const totalEnrollments = enrollments.length;

  // Calculate average session duration
  let totalWatchTime = 0;
  let studentsWithWatchTime = 0;

  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    if (progress.totalWatchTime && progress.totalWatchTime > 0) {
      totalWatchTime += progress.totalWatchTime;
      studentsWithWatchTime++;
    }
  });

  const averageSessionDuration =
    studentsWithWatchTime > 0
      ? Math.round(totalWatchTime / studentsWithWatchTime / 60)
      : 0;

  // Get chat participation
  const chatRooms = await ChatRoom.findAll({
    where: { course_id: courseIds, type: "group" },
    attributes: ["id"],
  });

  const chatRoomIds = chatRooms.map((r) => r.id);

  let chatParticipation = 0;
  if (chatRoomIds.length > 0) {
    const uniqueSenders = await ChatMessage.count({
      where: { room_id: chatRoomIds },
      distinct: true,
      col: "sender_id",
    });

    chatParticipation =
      totalEnrollments > 0
        ? parseFloat(((uniqueSenders / totalEnrollments) * 100).toFixed(1))
        : 0;
  }

  // Active students by day of week
  const dayOfWeekMap = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  const activeByDay = {};
  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : null;

    if (lastAccessed && lastAccessed >= startDate) {
      const dayOfWeek = lastAccessed.getDay();
      const dayName = dayOfWeekMap[dayOfWeek];
      activeByDay[dayName] = (activeByDay[dayName] || 0) + 1;
    }
  });

  const activeStudentsPerDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => ({
      day,
      count: activeByDay[day] || 0,
    })
  );

  return {
    chatParticipation,
    averageSessionDuration,
    activeStudentsPerDay,
  };
};

/**
 * Export analytics data
 */
export const exportAnalyticsData = async (instructorId, courseId = null, days = 30) => {
  const analytics = await getComprehensiveAnalytics(instructorId, courseId, days);

  return {
    ...analytics,
    exported_at: new Date().toISOString(),
    instructor_id: instructorId,
    course_id: courseId,
    period_days: days,
  };
};

/**
 * Get all courses for instructor
 */
export const getAllCoursesService = async (instructorId) => {
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: [
      "id",
      "title",
      "subtitle",
      "description",
      "category",
      "subcategory",
      "level",
      "price",
      "thumbnail_url",
      "status",
      "createdAt",
      "updatedAt",
    ],
    order: [["createdAt", "DESC"]],
  });

  return courses;
};
