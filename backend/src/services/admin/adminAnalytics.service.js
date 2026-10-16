import Course from "../../models/courses/course.model.js";
import Enrollment from "../../models/courses/enrollment.model.js";
import Payment from "../../models/payments/payment.model.js";
import User from "../../models/auth/user.model.js";
import Ratings from "../../models/courses/Ratings.model.js";

export const getPlatformOverview = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  const hasDates = Object.keys(dateFilter).length > 0;

  const [totalUsers, newUsers, totalCourses, totalEnrollments, newEnrollments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments(hasDates ? { createdAt: dateFilter } : {}),
    Course.countDocuments({ status: "approved" }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments(hasDates ? { enrolled_at: dateFilter } : {}),
  ]);

  // Revenue aggregation
  const revenueAgg = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  const periodRevenueAgg = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        ...(hasDates && { createdAt: dateFilter }),
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const periodRevenue = periodRevenueAgg[0]?.total || 0;

  let revenueChange = 0;
  if (startDate && endDate) {
    const periodLength = new Date(endDate) - new Date(startDate);
    const previousStart = new Date(new Date(startDate) - periodLength);
    const previousEnd = new Date(startDate);

    const prevAgg = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: previousStart, $lt: previousEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const previousPeriodRevenue = prevAgg[0]?.total || 0;

    if (previousPeriodRevenue > 0) {
      revenueChange = (((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100).toFixed(1);
    }
  }

  // Active students (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const enrollments = await Enrollment.find().select("progress").lean();
  let activeStudents = 0;
  enrollments.forEach((enrollment) => {
    const lastAccessed = enrollment.progress?.lastAccessed
      ? new Date(enrollment.progress.lastAccessed)
      : null;
    if (lastAccessed && lastAccessed >= thirtyDaysAgo) activeStudents++;
  });

  const pendingReviews = await Course.countDocuments({ status: "pending" });

  return {
    totalUsers,
    newUsers,
    totalCourses,
    totalEnrollments,
    newEnrollments,
    totalRevenue: parseFloat(totalRevenue).toFixed(2),
    periodRevenue: parseFloat(periodRevenue).toFixed(2),
    revenueChange: parseFloat(revenueChange),
    activeStudents,
    pendingReviews,
  };
};

export const getRevenueAnalytics = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;

  const matchStage = { status: "completed" };
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const totalRevenueAgg = await Payment.aggregate([
    { $match: matchStage },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  // Daily revenue
  const dailyRevenue = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Monthly revenue
  const monthlyRevenue = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalRevenue: parseFloat(totalRevenue).toFixed(2),
    daily: dailyRevenue.map((item) => ({
      date: item._id,
      revenue: parseFloat(item.revenue).toFixed(2),
      transactions: item.transactions,
    })),
    monthly: monthlyRevenue.map((item) => ({
      month: item._id,
      revenue: parseFloat(item.revenue).toFixed(2),
      transactions: item.transactions,
    })),
  };
};

export const getUserGrowthAnalytics = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const [totalUsers, usersByRole, userGrowth] = await Promise.all([
    User.countDocuments(),
    User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    totalUsers,
    usersByRole: usersByRole.map((item) => ({
      role: item._id,
      count: item.count,
    })),
    userGrowth: userGrowth.map((item) => ({
      date: item._id,
      newUsers: item.newUsers,
    })),
  };
};

export const getEnrollmentAnalytics = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.enrolled_at = {};
    if (startDate) matchStage.enrolled_at.$gte = new Date(startDate);
    if (endDate) matchStage.enrolled_at.$lte = new Date(endDate);
  }

  const [totalEnrollments, enrollmentTrend] = await Promise.all([
    Enrollment.countDocuments(matchStage),
    Enrollment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolled_at" } },
          enrollments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const allEnrollments = await Enrollment.find().select("progress").lean();

  let completedCount = 0;
  let totalProgress = 0;

  allEnrollments.forEach((enrollment) => {
    const completionPercentage = enrollment.progress?.completionPercentage || 0;
    totalProgress += completionPercentage;
    if (completionPercentage === 100) completedCount++;
  });

  const completionRate =
    allEnrollments.length > 0
      ? ((completedCount / allEnrollments.length) * 100).toFixed(1)
      : 0;

  return {
    totalEnrollments,
    completionRate: parseFloat(completionRate),
    enrollmentTrend: enrollmentTrend.map((item) => ({
      date: item._id,
      enrollments: item.enrollments,
    })),
  };
};

export const getCoursePerformanceAnalytics = async () => {
  const topByEnrollments = await Enrollment.aggregate([
    {
      $group: {
        _id: "$course_id",
        enrollments: { $sum: 1 },
      },
    },
    { $sort: { enrollments: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmpty: true } },
  ]);

  const topByRevenue = await Payment.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$course_id",
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmpty: true } },
  ]);

  return {
    topByEnrollments: topByEnrollments.map((item) => ({
      courseId: item._id,
      courseTitle: item.course?.title || "Unknown",
      enrollments: item.enrollments,
    })),
    topByRevenue: topByRevenue.map((item) => ({
      courseId: item._id,
      courseTitle: item.course?.title || "Unknown",
      revenue: parseFloat(item.revenue).toFixed(2),
    })),
  };
};

export const exportAnalyticsData = async (dateRange = {}) => {
  const [overview, revenue, userGrowth, enrollments, coursePerformance] = await Promise.all([
    getPlatformOverview(dateRange),
    getRevenueAnalytics(dateRange),
    getUserGrowthAnalytics(dateRange),
    getEnrollmentAnalytics(dateRange),
    getCoursePerformanceAnalytics(),
  ]);

  return {
    overview,
    revenue,
    userGrowth,
    enrollments,
    coursePerformance,
    exportedAt: new Date().toISOString(),
    dateRange,
  };
};

export default {
  getPlatformOverview,
  getRevenueAnalytics,
  getUserGrowthAnalytics,
  getEnrollmentAnalytics,
  getCoursePerformanceAnalytics,
  exportAnalyticsData,
};
