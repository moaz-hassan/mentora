/**
 * Analytics Service
 * Purpose: Handle analytics and reporting for instructors
 * Includes: Dashboard stats, course analytics, revenue analytics, engagement metrics
 */

import models from "../models/index.model.js";
import { Op, Sequelize } from "sequelize";

const {
  Course,
  Enrollment,
  Payment,
  CourseReview,
  User,
  Lesson,
  Quiz,
  QuizResult,
  ChatMessage,
  Chapter,
} = models;

/**
 * Get instructor dashboard overview statistics
 */
export const getInstructorOverview = async (instructorId) => {
  // Get all instructor courses
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id"],
  });

  const courseIds = courses.map((c) => c.id);

  // Total students (unique enrollments across all courses)
  const totalStudents = await Enrollment.count({
    where: { course_id: courseIds },
    distinct: true,
    col: "student_id",
  });

  // Total earnings
  const earningsResult = await Payment.sum("amount", {
    where: {
      course_id: courseIds,
      status: "completed",
    },
  });
  const totalEarnings = earningsResult || 0;

  // Number of courses
  const courseCount = courses.length;

  // Average rating across all courses
  const ratingResult = await CourseReview.findOne({
    where: { course_id: courseIds },
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("rating")), "avgRating"],
    ],
    raw: true,
  });
  const averageRating = ratingResult.avgRating
    ? parseFloat(ratingResult.avgRating).toFixed(1)
    : null;

  // Recent enrollments (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEnrollments = await Enrollment.count({
    where: {
      course_id: courseIds,
      enrolled_at: { [Op.gte]: thirtyDaysAgo },
    },
  });

  return {
    total_students: totalStudents,
    total_earnings: parseFloat(totalEarnings).toFixed(2),
    course_count: courseCount,
    average_rating: averageRating,
    recent_enrollments: recentEnrollments,
  };
};

/**
 * Get course-specific analytics
 */
export const getCourseAnalytics = async (courseId, instructorId) => {
  // Verify instructor owns the course
  const course = await Course.findByPk(courseId);

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You do not have permission to view analytics for this course");
    error.statusCode = 403;
    throw error;
  }

  // Total enrollments
  const totalEnrollments = await Enrollment.count({
    where: { course_id: courseId },
  });

  // Active students (accessed in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const enrollments = await Enrollment.findAll({
    where: { course_id: courseId },
    attributes: ["id", "progress"],
  });

  let activeStudents = 0;
  let completedCourses = 0;
  let totalCompletionPercentage = 0;

  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : null;

    if (lastAccessed && lastAccessed >= thirtyDaysAgo) {
      activeStudents++;
    }

    if (progress.completionPercentage === 100) {
      completedCourses++;
    }

    totalCompletionPercentage += progress.completionPercentage || 0;
  });

  const averageCompletionRate =
    enrollments.length > 0
      ? (totalCompletionPercentage / enrollments.length).toFixed(1)
      : 0;

  const completionRate =
    totalEnrollments > 0
      ? ((completedCourses / totalEnrollments) * 100).toFixed(1)
      : 0;

  // Average quiz scores
  const quizResults = await QuizResult.findAll({
    include: [
      {
        model: Quiz,
        include: [
          {
            model: Chapter,
            where: { course_id: courseId },
            required: true,
          },
        ],
        required: true,
      },
    ],
    attributes: ["score"],
  });

  const averageQuizScore =
    quizResults.length > 0
      ? (
          quizResults.reduce((sum, result) => sum + result.score, 0) /
          quizResults.length
        ).toFixed(1)
      : null;

  // Student engagement (chat participation)
  const chatRooms = await models.ChatRoom.findAll({
    where: { course_id: courseId, type: "group" },
    attributes: ["id"],
  });

  const chatRoomIds = chatRooms.map((r) => r.id);

  const totalMessages = await ChatMessage.count({
    where: { room_id: chatRoomIds },
  });

  const uniqueMessageSenders = await ChatMessage.count({
    where: { room_id: chatRoomIds },
    distinct: true,
    col: "sender_id",
  });

  const chatParticipationRate =
    totalEnrollments > 0
      ? ((uniqueMessageSenders / totalEnrollments) * 100).toFixed(1)
      : 0;

  return {
    course_id: courseId,
    course_title: course.title,
    total_enrollments: totalEnrollments,
    active_students: activeStudents,
    completion_rate: parseFloat(completionRate),
    average_completion_percentage: parseFloat(averageCompletionRate),
    average_quiz_score: averageQuizScore ? parseFloat(averageQuizScore) : null,
    engagement: {
      total_messages: totalMessages,
      chat_participation_rate: parseFloat(chatParticipationRate),
    },
  };
};

/**
 * Get revenue analytics for instructor
 */
export const getRevenueAnalytics = async (instructorId, startDate, endDate) => {
  // Get all instructor courses
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id", "title"],
  });

  const courseIds = courses.map((c) => c.id);

  // Build date filter
  const dateFilter = {};
  if (startDate) {
    dateFilter[Op.gte] = new Date(startDate);
  }
  if (endDate) {
    dateFilter[Op.lte] = new Date(endDate);
  }

  const whereClause = {
    course_id: courseIds,
    status: "completed",
  };

  if (Object.keys(dateFilter).length > 0) {
    whereClause.created_at = dateFilter;
  }

  // Total revenue
  const totalRevenue = await Payment.sum("amount", { where: whereClause });

  // Revenue by course
  const revenueByCourse = await Payment.findAll({
    where: whereClause,
    attributes: [
      "course_id",
      [Sequelize.fn("SUM", Sequelize.col("amount")), "revenue"],
      [Sequelize.fn("COUNT", Sequelize.col("Payment.id")), "sales"],
    ],
    group: ["course_id"],
    include: [
      {
        model: Course,
        attributes: ["title"],
      },
    ],
    raw: true,
  });

  // Revenue by month
  const revenueByMonth = await Payment.findAll({
    where: whereClause,
    attributes: [
      [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("Payment.created_at"),
          "%Y-%m"
        ),
        "month",
      ],
      [Sequelize.fn("SUM", Sequelize.col("amount")), "revenue"],
      [Sequelize.fn("COUNT", Sequelize.col("Payment.id")), "sales"],
    ],
    group: [
      Sequelize.fn(
        "DATE_FORMAT",
        Sequelize.col("Payment.created_at"),
        "%Y-%m"
      ),
    ],
    order: [[Sequelize.literal("month"), "ASC"]],
    raw: true,
  });

  // Refund rate
  const totalPayments = await Payment.count({
    where: { course_id: courseIds },
  });

  const refundedPayments = await Payment.count({
    where: { course_id: courseIds, status: "refunded" },
  });

  const refundRate =
    totalPayments > 0 ? ((refundedPayments / totalPayments) * 100).toFixed(1) : 0;

  // Average transaction value
  const averageTransactionValue =
    totalPayments > 0 ? (totalRevenue / totalPayments).toFixed(2) : 0;

  return {
    total_revenue: parseFloat(totalRevenue || 0).toFixed(2),
    revenue_by_course: revenueByCourse.map((item) => ({
      course_id: item.course_id,
      course_title: item["Course.title"],
      revenue: parseFloat(item.revenue).toFixed(2),
      sales: parseInt(item.sales),
    })),
    revenue_by_month: revenueByMonth.map((item) => ({
      month: item.month,
      revenue: parseFloat(item.revenue).toFixed(2),
      sales: parseInt(item.sales),
    })),
    refund_rate: parseFloat(refundRate),
    average_transaction_value: parseFloat(averageTransactionValue),
  };
};

/**
 * Get student engagement metrics
 */
export const getEngagementMetrics = async (instructorId, days = 30) => {
  // Get all instructor courses
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id"],
  });

  const courseIds = courses.map((c) => c.id);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Active students per day
  const enrollments = await Enrollment.findAll({
    where: { course_id: courseIds },
    attributes: ["id", "progress"],
  });

  const activeStudentsByDay = {};
  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : null;

    if (lastAccessed && lastAccessed >= startDate) {
      const dateKey = lastAccessed.toISOString().split("T")[0];
      activeStudentsByDay[dateKey] = (activeStudentsByDay[dateKey] || 0) + 1;
    }
  });

  // Chat participation rate
  const chatRooms = await models.ChatRoom.findAll({
    where: { course_id: courseIds, type: "group" },
    attributes: ["id"],
  });

  const chatRoomIds = chatRooms.map((r) => r.id);

  const uniqueMessageSenders = await ChatMessage.count({
    where: {
      room_id: chatRoomIds,
      created_at: { [Op.gte]: startDate },
    },
    distinct: true,
    col: "sender_id",
  });

  const totalStudents = enrollments.length;
  const chatParticipationRate =
    totalStudents > 0
      ? ((uniqueMessageSenders / totalStudents) * 100).toFixed(1)
      : 0;

  // Average session duration (based on watch time)
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
      ? Math.round(totalWatchTime / studentsWithWatchTime / 60) // Convert to minutes
      : 0;

  return {
    period_days: days,
    active_students_by_day: Object.entries(activeStudentsByDay).map(
      ([date, count]) => ({
        date,
        active_students: count,
      })
    ),
    chat_participation_rate: parseFloat(chatParticipationRate),
    average_session_duration_minutes: averageSessionDuration,
    total_students: totalStudents,
  };
};

/**
 * Export analytics data as CSV
 */
export const exportAnalyticsData = async (instructorId, startDate, endDate) => {
  const overview = await getInstructorOverview(instructorId);
  const revenue = await getRevenueAnalytics(instructorId, startDate, endDate);
  const engagement = await getEngagementMetrics(instructorId, 30);

  // Build CSV data
  const csvData = {
    overview,
    revenue,
    engagement,
    exported_at: new Date().toISOString(),
  };

  return csvData;
};


/**
 * Get enrollment trend with flexible grouping
 */
export const getEnrollmentTrendWithGrouping = async (instructorId, days = 30, groupBy = 'day') => {
  // Get all instructor courses
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id"],
  });

  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return { enrollments: [] };
  }

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

  // Group enrollments based on groupBy parameter
  const groupedData = {};

  enrollments.forEach((enrollment) => {
    const enrollDate = new Date(enrollment.enrolled_at);
    let key;

    if (groupBy === 'day') {
      // Group by day: YYYY-MM-DD
      key = enrollDate.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      // Group by week number
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksDiff = Math.floor((enrollDate - startDate) / msPerWeek);
      key = `Week ${weeksDiff + 1}`;
    } else if (groupBy === 'month') {
      // Group by month: YYYY-MM
      key = `${enrollDate.getFullYear()}-${String(enrollDate.getMonth() + 1).padStart(2, '0')}`;
    } else {
      // Default to day
      key = enrollDate.toISOString().split('T')[0];
    }

    groupedData[key] = (groupedData[key] || 0) + 1;
  });

  // Convert to array format
  const trend = Object.entries(groupedData).map(([date, count]) => ({
    date,
    enrollments: count,
  }));

  return { enrollments: trend };
};


/**
 * Anonymize student data for privacy
 */
const anonymizeStudentData = (data, anonymize) => {
  if (!anonymize) return data;

  // Helper function to anonymize a single student object
  const anonymizeStudent = (student, index) => {
    if (!student) return student;
    return {
      ...student,
      first_name: `Student`,
      last_name: `#${index + 1}`,
      full_name: `Student #${index + 1}`,
      email: `student${index + 1}@anonymous.com`,
    };
  };

  // Create a deep copy to avoid mutating original data
  const anonymizedData = JSON.parse(JSON.stringify(data));

  // Anonymize any student references in the data
  if (anonymizedData.students && Array.isArray(anonymizedData.students)) {
    anonymizedData.students = anonymizedData.students.map((student, index) =>
      anonymizeStudent(student, index)
    );
  }

  return anonymizedData;
};

/**
 * Generate comprehensive analytics report
 */
export const generateComprehensiveReport = async (
  instructorId,
  startDate,
  endDate,
  courseIds = null,
  anonymizeStudents = true
) => {
  // Get instructor courses
  const courseFilter = {
    instructor_id: instructorId,
    status: "approved",
  };

  if (courseIds && courseIds.length > 0) {
    courseFilter.id = courseIds;
  }

  const courses = await Course.findAll({
    where: courseFilter,
    attributes: ["id", "title", "thumbnail_url", "description", "price"],
  });

  if (courses.length === 0) {
    return {
      overview: {},
      courses: [],
      revenue: {},
      enrollmentTrend: [],
      engagement: {},
      generated_at: new Date().toISOString(),
    };
  }

  const courseIdsArray = courses.map((c) => c.id);

  // Build date filter
  const dateFilter = {};
  if (startDate) {
    dateFilter[Op.gte] = new Date(startDate);
  }
  if (endDate) {
    dateFilter[Op.lte] = new Date(endDate);
  }

  // Get overview statistics
  const enrollments = await Enrollment.findAll({
    where: {
      course_id: courseIdsArray,
      ...(Object.keys(dateFilter).length > 0 && { enrolled_at: dateFilter }),
    },
    attributes: ["id", "progress", "student_id"],
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email"],
      },
    ],
  });

  const totalEnrollments = enrollments.length;

  // Calculate active students
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

  // Get average rating
  const ratingResult = await CourseReview.findOne({
    where: { course_id: courseIdsArray },
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("rating")), "avgRating"],
    ],
    raw: true,
  });

  const averageRating = ratingResult?.avgRating
    ? parseFloat(parseFloat(ratingResult.avgRating).toFixed(1))
    : 0;

  // Get revenue data
  const revenueWhereClause = {
    course_id: courseIdsArray,
    status: "completed",
  };

  if (Object.keys(dateFilter).length > 0) {
    revenueWhereClause.created_at = dateFilter;
  }

  const totalRevenue = await Payment.sum("amount", {
    where: revenueWhereClause,
  });

  // Revenue by course
  const revenueByCourse = await Payment.findAll({
    where: revenueWhereClause,
    attributes: [
      "course_id",
      [Sequelize.fn("SUM", Sequelize.col("amount")), "revenue"],
      [Sequelize.fn("COUNT", Sequelize.col("Payment.id")), "sales"],
    ],
    group: ["course_id"],
    include: [
      {
        model: Course,
        attributes: ["title", "price"],
      },
    ],
    raw: true,
  });

  // Revenue by month
  const revenueByMonth = await Payment.findAll({
    where: revenueWhereClause,
    attributes: [
      [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("Payment.created_at"),
          "%Y-%m"
        ),
        "month",
      ],
      [Sequelize.fn("SUM", Sequelize.col("amount")), "revenue"],
      [Sequelize.fn("COUNT", Sequelize.col("Payment.id")), "sales"],
    ],
    group: [
      Sequelize.fn(
        "DATE_FORMAT",
        Sequelize.col("Payment.created_at"),
        "%Y-%m"
      ),
    ],
    order: [[Sequelize.literal("month"), "ASC"]],
    raw: true,
  });

  // Get enrollment trend
  const enrollmentTrendData = await getEnrollmentTrendWithGrouping(
    instructorId,
    endDate && startDate
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 30,
    'day'
  );

  // Get engagement metrics
  const chatRooms = await models.ChatRoom.findAll({
    where: { course_id: courseIdsArray, type: "group" },
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

  // Get quiz analytics
  const quizzes = await Quiz.findAll({
    include: [
      {
        model: Chapter,
        where: { course_id: courseIdsArray },
        attributes: [],
        required: true,
      },
    ],
    attributes: ["id"],
  });

  const quizIds = quizzes.map((q) => q.id);

  let quizAnalytics = {
    averageScore: 0,
    passRate: 0,
    totalAttempts: 0,
  };

  if (quizIds.length > 0) {
    const quizResults = await QuizResult.findAll({
      where: { quiz_id: quizIds },
      attributes: ["score"],
    });

    const totalAttempts = quizResults.length;

    if (totalAttempts > 0) {
      const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
      const averageScore = parseFloat((totalScore / totalAttempts).toFixed(1));
      const passCount = quizResults.filter((result) => result.score >= 60).length;
      const passRate = parseFloat(((passCount / totalAttempts) * 100).toFixed(1));

      quizAnalytics = {
        averageScore,
        passRate,
        totalAttempts,
      };
    }
  }

  // Compile report data
  let reportData = {
    overview: {
      totalEnrollments,
      activeStudents,
      completionRate,
      averageRating,
      totalRevenue: parseFloat((totalRevenue || 0).toFixed(2)),
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    },
    courses: courses.map((course) => {
      const courseRevenue = revenueByCourse.find(
        (r) => r.course_id === course.id
      );
      const courseEnrollments = enrollments.filter(
        (e) => e.course_id === course.id
      );

      return {
        id: course.id,
        title: course.title,
        thumbnail_url: course.thumbnail_url,
        description: course.description,
        price: course.price,
        enrollments: courseEnrollments.length,
        revenue: courseRevenue
          ? parseFloat(courseRevenue.revenue).toFixed(2)
          : "0.00",
        sales: courseRevenue ? parseInt(courseRevenue.sales) : 0,
      };
    }),
    revenue: {
      total_revenue: parseFloat((totalRevenue || 0).toFixed(2)),
      revenue_by_course: revenueByCourse.map((item) => ({
        course_id: item.course_id,
        course_title: item["Course.title"],
        course_price: item["Course.price"],
        revenue: parseFloat(item.revenue).toFixed(2),
        sales: parseInt(item.sales),
      })),
      revenue_by_month: revenueByMonth.map((item) => ({
        month: item.month,
        revenue: parseFloat(item.revenue).toFixed(2),
        sales: parseInt(item.sales),
      })),
    },
    enrollmentTrend: enrollmentTrendData.enrollments,
    engagement: {
      chatParticipation,
      totalStudents: totalEnrollments,
    },
    quizAnalytics,
    generated_at: new Date().toISOString(),
    instructor_id: instructorId,
  };

  // Anonymize student data if requested
  if (anonymizeStudents) {
    reportData = anonymizeStudentData(reportData, true);
  }

  return reportData;
};
