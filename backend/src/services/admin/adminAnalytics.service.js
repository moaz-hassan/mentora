/**
 * Admin Analytics Service
 * Purpose: Handle platform-wide analytics for administrators
 */

import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const { Course, Enrollment, Payment, User, CourseReview } = models;

/**
 * Get platform overview analytics
 */
export const getPlatformOverview = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;
  
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = new Date(startDate);
  if (endDate) dateFilter[Op.lte] = new Date(endDate);

  const totalUsers = await User.count();
  const newUsers = await User.count({
    where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
  });

  const totalCourses = await Course.count({ where: { status: "approved" } });
  const totalEnrollments = await Enrollment.count();
  const newEnrollments = await Enrollment.count({
    where: Object.keys(dateFilter).length > 0 ? { enrolled_at: dateFilter } : {}
  });

  const totalRevenue = await Payment.sum("amount", { where: { status: "completed" } });
  const periodRevenue = await Payment.sum("amount", {
    where: {
      status: "completed",
      ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
    }
  });

  let revenueChange = 0;
  if (startDate && endDate) {
    const periodLength = new Date(endDate) - new Date(startDate);
    const previousStart = new Date(new Date(startDate) - periodLength);
    const previousEnd = new Date(startDate);
    
    const previousPeriodRevenue = await Payment.sum("amount", {
      where: {
        status: "completed",
        created_at: { [Op.gte]: previousStart, [Op.lt]: previousEnd }
      }
    }) || 0;
    
    if (previousPeriodRevenue > 0) {
      revenueChange = ((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1);
    }
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const enrollments = await Enrollment.findAll({ attributes: ["id", "progress"] });
  let activeStudents = 0;
  enrollments.forEach(enrollment => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed ? new Date(progress.lastAccessed) : null;
    if (lastAccessed && lastAccessed >= thirtyDaysAgo) activeStudents++;
  });

  const pendingReviews = await Course.count({ where: { status: "pending" } });

  return {
    totalUsers,
    newUsers,
    totalCourses,
    totalEnrollments,
    newEnrollments,
    totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
    periodRevenue: parseFloat(periodRevenue || 0).toFixed(2),
    revenueChange: parseFloat(revenueChange),
    activeStudents,
    pendingReviews
  };
};

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;
  
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = new Date(startDate);
  if (endDate) dateFilter[Op.lte] = new Date(endDate);

  const whereClause = {
    status: "completed",
    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
  };

  const totalRevenue = await Payment.sum("amount", { where: whereClause });

  const dailyRevenue = await Payment.findAll({
    where: whereClause,
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("COUNT", col("id")), "transactions"]
    ],
    group: [fn("DATE", col("created_at"))],
    order: [[literal("date"), "ASC"]],
    raw: true
  });

  const monthlyRevenue = await Payment.findAll({
    where: whereClause,
    attributes: [
      [fn("DATE_FORMAT", col("created_at"), "%Y-%m"), "month"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("COUNT", col("id")), "transactions"]
    ],
    group: [fn("DATE_FORMAT", col("created_at"), "%Y-%m")],
    order: [[literal("month"), "ASC"]],
    raw: true
  });

  return {
    totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
    daily: dailyRevenue.map(item => ({
      date: item.date,
      revenue: parseFloat(item.revenue).toFixed(2),
      transactions: parseInt(item.transactions)
    })),
    monthly: monthlyRevenue.map(item => ({
      month: item.month,
      revenue: parseFloat(item.revenue).toFixed(2),
      transactions: parseInt(item.transactions)
    }))
  };
};

/**
 * Get user growth analytics
 */
export const getUserGrowthAnalytics = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;
  
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = new Date(startDate);
  if (endDate) dateFilter[Op.lte] = new Date(endDate);

  const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const usersByRole = await User.findAll({
    attributes: [
      "role",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["role"],
    raw: true
  });

  const userGrowth = await User.findAll({
    where: whereClause,
    attributes: [
      [fn("DATE", col("createdAt")), "date"],
      [fn("COUNT", col("id")), "newUsers"]
    ],
    group: [fn("DATE", col("createdAt"))],
    order: [[literal("date"), "ASC"]],
    raw: true
  });

  return {
    totalUsers: await User.count(),
    usersByRole: usersByRole.map(item => ({
      role: item.role,
      count: parseInt(item.count)
    })),
    userGrowth: userGrowth.map(item => ({
      date: item.date,
      newUsers: parseInt(item.newUsers)
    }))
  };
};

/**
 * Get enrollment analytics
 */
export const getEnrollmentAnalytics = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;
  
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = new Date(startDate);
  if (endDate) dateFilter[Op.lte] = new Date(endDate);

  const whereClause = Object.keys(dateFilter).length > 0 ? { enrolled_at: dateFilter } : {};

  const totalEnrollments = await Enrollment.count({ where: whereClause });

  const enrollmentTrend = await Enrollment.findAll({
    where: whereClause,
    attributes: [
      [fn("DATE", col("enrolled_at")), "date"],
      [fn("COUNT", col("id")), "enrollments"]
    ],
    group: [fn("DATE", col("enrolled_at"))],
    order: [[literal("date"), "ASC"]],
    raw: true
  });

  const allEnrollments = await Enrollment.findAll({ attributes: ["id", "progress"] });
  
  let completedCount = 0;
  let totalProgress = 0;
  
  allEnrollments.forEach(enrollment => {
    const progress = enrollment.progress || {};
    const completionPercentage = progress.completionPercentage || 0;
    totalProgress += completionPercentage;
    if (completionPercentage === 100) completedCount++;
  });

  const completionRate = allEnrollments.length > 0 
    ? ((completedCount / allEnrollments.length) * 100).toFixed(1)
    : 0;

  return {
    totalEnrollments,
    completionRate: parseFloat(completionRate),
    enrollmentTrend: enrollmentTrend.map(item => ({
      date: item.date,
      enrollments: parseInt(item.enrollments)
    }))
  };
};

/**
 * Get course performance analytics
 */
export const getCoursePerformanceAnalytics = async () => {
  const topByEnrollments = await Enrollment.findAll({
    attributes: [
      "course_id",
      [fn("COUNT", col("Enrollment.id")), "enrollments"]
    ],
    group: ["course_id"],
    include: [{
      model: Course,
      attributes: ["title", "price"]
    }],
    order: [[literal("enrollments"), "DESC"]],
    limit: 10,
    raw: true
  });

  const topByRevenue = await Payment.findAll({
    where: { status: "completed" },
    attributes: [
      "course_id",
      [fn("SUM", col("amount")), "revenue"]
    ],
    group: ["course_id"],
    include: [{
      model: Course,
      attributes: ["title"]
    }],
    order: [[literal("revenue"), "DESC"]],
    limit: 10,
    raw: true
  });

  return {
    topByEnrollments: topByEnrollments.map(item => ({
      courseId: item.course_id,
      courseTitle: item["Course.title"],
      enrollments: parseInt(item.enrollments)
    })),
    topByRevenue: topByRevenue.map(item => ({
      courseId: item.course_id,
      courseTitle: item["Course.title"],
      revenue: parseFloat(item.revenue).toFixed(2)
    }))
  };
};

/**
 * Export analytics data
 */
export const exportAnalyticsData = async (dateRange = {}) => {
  const overview = await getPlatformOverview(dateRange);
  const revenue = await getRevenueAnalytics(dateRange);
  const userGrowth = await getUserGrowthAnalytics(dateRange);
  const enrollments = await getEnrollmentAnalytics(dateRange);
  const coursePerformance = await getCoursePerformanceAnalytics();

  return {
    overview,
    revenue,
    userGrowth,
    enrollments,
    coursePerformance,
    exportedAt: new Date().toISOString(),
    dateRange
  };
};
