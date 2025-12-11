

import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const { Enrollment, Payment, User, Course, Progress, CourseReview: Review, EnrollmentLog, PaymentLog } = models;


export const getEnrollmentAnalytics = async (filters = {}) => {
  const { startDate, endDate, courseId, groupBy = "day" } = filters;

  const whereClause = {};

  if (startDate || endDate) {
    whereClause.enrolled_at = {};
    if (startDate) whereClause.enrolled_at[Op.gte] = new Date(startDate);
    if (endDate) whereClause.enrolled_at[Op.lte] = new Date(endDate);
  }

  if (courseId) whereClause.course_id = courseId;

  
  const totalEnrollments = await Enrollment.count({ where: whereClause });

  
  const newEnrollments = await Enrollment.count({
    where: {
      ...whereClause,
      enrolled_at: {
        [Op.gte]: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  
  const allEnrollments = await Enrollment.findAll({
    where: whereClause,
    attributes: ['id', 'progress'],
    raw: true
  });
  const completedEnrollments = allEnrollments.filter(e => {
    const progress = typeof e.progress === 'string' ? JSON.parse(e.progress) : e.progress;
    return progress && progress.completionPercentage === 100;
  }).length;
  const completionRate = totalEnrollments > 0 
    ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
    : 0;

  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const inactiveEnrollments = allEnrollments.filter(e => {
    const progress = typeof e.progress === 'string' ? JSON.parse(e.progress) : e.progress;
    if (!progress || !progress.lastAccessed) return true;
    return new Date(progress.lastAccessed) < thirtyDaysAgo;
  }).length;

  
  let dateFormat;
  switch (groupBy) {
    case "hour":
      dateFormat = "%Y-%m-%d %H:00:00";
      break;
    case "day":
      dateFormat = "%Y-%m-%d";
      break;
    case "week":
      dateFormat = "%Y-%u";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  const trends = await Enrollment.findAll({
    where: whereClause,
    attributes: [
      [fn("DATE_FORMAT", col("enrolled_at"), dateFormat), "period"],
      [fn("COUNT", col("id")), "count"]
    ],
    group: [fn("DATE_FORMAT", col("enrolled_at"), dateFormat)],
    order: [[fn("DATE_FORMAT", col("enrolled_at"), dateFormat), "ASC"]],
    raw: true
  });

  
  const byCourse = await Enrollment.findAll({
    where: whereClause,
    attributes: [
      "course_id",
      [fn("COUNT", col("Enrollment.id")), "count"]
    ],
    include: [
      {
        model: Course,
        attributes: ["id", "title"]
      }
    ],
    group: ["course_id", "Course.id"],
    order: [[literal("count"), "DESC"]],
    limit: 10,
    raw: false
  });

  return {
    summary: {
      totalEnrollments,
      newEnrollments,
      completedEnrollments,
      completionRate: parseFloat(completionRate),
      inactiveEnrollments,
      dropOffRate: totalEnrollments > 0 
        ? ((inactiveEnrollments / totalEnrollments) * 100).toFixed(1)
        : 0
    },
    trends: trends.map(t => ({
      period: t.period,
      count: parseInt(t.count)
    })),
    topCourses: byCourse.map(item => ({
      courseId: item.course_id,
      courseTitle: item.Course?.title || "Unknown",
      enrollmentCount: parseInt(item.dataValues.count)
    })),
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
      groupBy
    }
  };
};


export const getPaymentAnalytics = async (filters = {}) => {
  const { startDate, endDate, status, groupBy = "day" } = filters;

  const whereClause = {};

  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
    if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
  }

  if (status) whereClause.status = status;

  
  const revenueData = await Payment.findAll({
    where: { ...whereClause, status: "completed" },
    attributes: [
      [fn("SUM", col("amount")), "totalRevenue"],
      [fn("COUNT", col("id")), "totalPayments"]
    ],
    raw: true
  });

  const totalRevenue = parseFloat(revenueData[0]?.totalRevenue || 0);
  const totalPayments = parseInt(revenueData[0]?.totalPayments || 0);

  
  const totalAttempts = await Payment.count({ where: whereClause });
  const successfulPayments = await Payment.count({
    where: { ...whereClause, status: "completed" }
  });
  const successRate = totalAttempts > 0 
    ? ((successfulPayments / totalAttempts) * 100).toFixed(1)
    : 0;

  
  const refundData = await Payment.findAll({
    where: { ...whereClause, status: "refunded" },
    attributes: [
      [fn("SUM", col("amount")), "totalRefunded"],
      [fn("COUNT", col("id")), "refundCount"]
    ],
    raw: true
  });

  const totalRefunded = parseFloat(refundData[0]?.totalRefunded || 0);
  const refundCount = parseInt(refundData[0]?.refundCount || 0);
  const refundRate = totalPayments > 0 
    ? ((refundCount / totalPayments) * 100).toFixed(1)
    : 0;

  
  const byPaymentMethod = await Payment.findAll({
    where: { ...whereClause, status: "completed" },
    attributes: [
      "payment_method",
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", col("amount")), "totalAmount"]
    ],
    group: ["payment_method"],
    raw: true
  });

  
  let dateFormat;
  switch (groupBy) {
    case "hour":
      dateFormat = "%Y-%m-%d %H:00:00";
      break;
    case "day":
      dateFormat = "%Y-%m-%d";
      break;
    case "week":
      dateFormat = "%Y-%u";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  const revenueTrends = await Payment.findAll({
    where: { ...whereClause, status: "completed" },
    attributes: [
      [fn("DATE_FORMAT", col("created_at"), dateFormat), "period"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("COUNT", col("id")), "count"]
    ],
    group: [fn("DATE_FORMAT", col("created_at"), dateFormat)],
    order: [[fn("DATE_FORMAT", col("created_at"), dateFormat), "ASC"]],
    raw: true
  });

  return {
    summary: {
      totalRevenue,
      totalPayments,
      averageTransactionValue: totalPayments > 0 ? (totalRevenue / totalPayments).toFixed(2) : 0,
      successRate: parseFloat(successRate),
      totalRefunded,
      refundCount,
      refundRate: parseFloat(refundRate)
    },
    paymentMethods: byPaymentMethod.map(pm => ({
      method: pm.payment_method,
      count: parseInt(pm.count),
      totalAmount: parseFloat(pm.totalAmount),
      percentage: totalPayments > 0 
        ? ((parseInt(pm.count) / totalPayments) * 100).toFixed(1)
        : 0
    })),
    trends: revenueTrends.map(t => ({
      period: t.period,
      revenue: parseFloat(t.revenue),
      count: parseInt(t.count)
    })),
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
      groupBy
    }
  };
};


export const getUserActivityAnalytics = async (filters = {}) => {
  const { startDate, endDate, role, groupBy = "day" } = filters;

  const whereClause = { is_active: true };

  if (role) whereClause.role = role;

  
  const totalActiveUsers = await User.count({ where: whereClause });

  
  const registrationWhere = { ...whereClause };
  if (startDate || endDate) {
    registrationWhere.createdAt = {};
    if (startDate) registrationWhere.createdAt[Op.gte] = new Date(startDate);
    if (endDate) registrationWhere.createdAt[Op.lte] = new Date(endDate);
  }

  const newRegistrations = await User.count({ where: registrationWhere });

  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const activeLastWeek = await User.count({
    where: {
      ...whereClause,
      updatedAt: { [Op.gte]: sevenDaysAgo }
    }
  });

  const activeLastMonth = await User.count({
    where: {
      ...whereClause,
      updatedAt: { [Op.gte]: thirtyDaysAgo }
    }
  });

  
  const retentionRate = totalActiveUsers > 0 
    ? ((activeLastMonth / totalActiveUsers) * 100).toFixed(1)
    : 0;

  
  let dateFormat;
  switch (groupBy) {
    case "hour":
      dateFormat = "%Y-%m-%d %H:00:00";
      break;
    case "day":
      dateFormat = "%Y-%m-%d";
      break;
    case "week":
      dateFormat = "%Y-%u";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  const registrationTrends = await User.findAll({
    where: registrationWhere,
    attributes: [
      [fn("DATE_FORMAT", col("createdAt"), dateFormat), "period"],
      [fn("COUNT", col("id")), "count"]
    ],
    group: [fn("DATE_FORMAT", col("createdAt"), dateFormat)],
    order: [[fn("DATE_FORMAT", col("createdAt"), dateFormat), "ASC"]],
    raw: true
  });

  
  const byRole = await User.findAll({
    where: whereClause,
    attributes: [
      "role",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["role"],
    raw: true
  });

  return {
    summary: {
      totalActiveUsers,
      newRegistrations,
      activeLastWeek,
      activeLastMonth,
      retentionRate: parseFloat(retentionRate),
      weeklyEngagementRate: totalActiveUsers > 0 
        ? ((activeLastWeek / totalActiveUsers) * 100).toFixed(1)
        : 0
    },
    registrationTrends: registrationTrends.map(t => ({
      period: t.period,
      count: parseInt(t.count)
    })),
    usersByRole: byRole.map(r => ({
      role: r.role,
      count: parseInt(r.count),
      percentage: totalActiveUsers > 0 
        ? ((parseInt(r.count) / totalActiveUsers) * 100).toFixed(1)
        : 0
    })),
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
      groupBy
    }
  };
};


export const getCoursePerformanceAnalytics = async (filters = {}) => {
  const { startDate, endDate, instructorId, limit = 20 } = filters;

  const whereClause = { status: "published" };

  if (instructorId) whereClause.instructor_id = instructorId;

  
  const courses = await Course.findAll({
    where: whereClause,
    include: [
      {
        model: Enrollment,
        attributes: [],
        where: startDate || endDate ? {
          enrolled_at: {
            ...(startDate && { [Op.gte]: new Date(startDate) }),
            ...(endDate && { [Op.lte]: new Date(endDate) })
          }
        } : undefined,
        required: false
      },
      {
        model: Review,
        attributes: [],
        required: false
      },
      {
        model: Payment,
        attributes: [],
        where: { status: "completed" },
        required: false
      },
      {
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name"]
      }
    ],
    attributes: [
      "id",
      "title",
      "price",
      "instructor_id",
      [fn("COUNT", fn("DISTINCT", col("Enrollments.id"))), "enrollmentCount"],
      [fn("AVG", col("CourseReviews.rating")), "averageRating"],
      [fn("COUNT", fn("DISTINCT", col("CourseReviews.id"))), "reviewCount"],
      [fn("SUM", col("Payments.amount")), "totalRevenue"]
    ],
    group: ["Course.id", "Instructor.id"],
    order: [[literal("enrollmentCount"), "DESC"]],
    limit: parseInt(limit),
    raw: false,
    subQuery: false
  });

  
  const coursePerformance = await Promise.all(
    courses.map(async (course) => {
      const totalEnrollments = parseInt(course.dataValues.enrollmentCount || 0);
      
      
      const courseEnrollments = await Enrollment.findAll({
        where: {
          course_id: course.id,
          ...(startDate || endDate ? {
            enrolled_at: {
              ...(startDate && { [Op.gte]: new Date(startDate) }),
              ...(endDate && { [Op.lte]: new Date(endDate) })
            }
          } : {})
        },
        attributes: ['id', 'progress'],
        raw: true
      });
      const completedEnrollments = courseEnrollments.filter(e => {
        const progress = typeof e.progress === 'string' ? JSON.parse(e.progress) : e.progress;
        return progress && progress.completionPercentage === 100;
      }).length;

      const completionRate = totalEnrollments > 0 
        ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
        : 0;

      return {
        courseId: course.id,
        title: course.title,
        price: course.price,
        instructor: course.Instructor ? {
          id: course.Instructor.id,
          name: `${course.Instructor.first_name} ${course.Instructor.last_name}`
        } : null,
        enrollmentCount: totalEnrollments,
        completionRate: parseFloat(completionRate),
        averageRating: course.dataValues.averageRating 
          ? parseFloat(course.dataValues.averageRating).toFixed(1)
          : null,
        reviewCount: parseInt(course.dataValues.reviewCount || 0),
        totalRevenue: parseFloat(course.dataValues.totalRevenue || 0),
        revenuePerEnrollment: totalEnrollments > 0 
          ? (parseFloat(course.dataValues.totalRevenue || 0) / totalEnrollments).toFixed(2)
          : 0
      };
    })
  );

  
  const totalCourses = await Course.count({ where: whereClause });
  const totalEnrollments = coursePerformance.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const totalRevenue = coursePerformance.reduce((sum, c) => sum + c.totalRevenue, 0);
  const averageCompletionRate = coursePerformance.length > 0
    ? (coursePerformance.reduce((sum, c) => sum + parseFloat(c.completionRate), 0) / coursePerformance.length).toFixed(1)
    : 0;

  return {
    summary: {
      totalCourses,
      totalEnrollments,
      totalRevenue,
      averageCompletionRate: parseFloat(averageCompletionRate),
      averageRevenuePerCourse: totalCourses > 0 ? (totalRevenue / totalCourses).toFixed(2) : 0
    },
    courses: coursePerformance,
    period: {
      startDate: startDate || null,
      endDate: endDate || null
    }
  };
};


export const generateCustomReport = async (reportConfig) => {
  const { metrics, filters, groupBy } = reportConfig;

  const results = {};

  
  if (metrics.includes("enrollments")) {
    results.enrollments = await getEnrollmentAnalytics({ ...filters, groupBy });
  }

  if (metrics.includes("payments")) {
    results.payments = await getPaymentAnalytics({ ...filters, groupBy });
  }

  if (metrics.includes("users")) {
    results.users = await getUserActivityAnalytics({ ...filters, groupBy });
  }

  if (metrics.includes("courses")) {
    results.courses = await getCoursePerformanceAnalytics(filters);
  }

  return {
    reportName: reportConfig.name || "Custom Report",
    generatedAt: new Date(),
    configuration: reportConfig,
    data: results
  };
};


export const scheduleReport = async (scheduleConfig, adminId) => {
  const {
    name,
    metrics,
    filters,
    groupBy,
    frequency, 
    recipients, 
    format 
  } = scheduleConfig;

  
  if (!name || !metrics || !frequency || !recipients) {
    const error = new Error("Missing required schedule configuration");
    error.statusCode = 400;
    throw error;
  }

  
  
  
  const schedule = {
    id: `schedule_${Date.now()}`,
    name,
    metrics,
    filters: filters || {},
    groupBy: groupBy || "day",
    frequency,
    recipients,
    format: format || "csv",
    createdBy: adminId,
    createdAt: new Date(),
    status: "active",
    nextRun: calculateNextRun(frequency)
  };

  return {
    success: true,
    message: "Report scheduled successfully",
    schedule
  };
};


function calculateNextRun(frequency) {
  const now = new Date();
  
  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}


export const exportAnalyticsToCSV = async (reportType, data) => {
  let csvContent = "";

  switch (reportType) {
    case "enrollments":
      csvContent = "Period,Enrollment Count\n";
      data.trends.forEach(trend => {
        csvContent += `${trend.period},${trend.count}\n`;
      });
      break;

    case "payments":
      csvContent = "Period,Revenue,Payment Count\n";
      data.trends.forEach(trend => {
        csvContent += `${trend.period},${trend.revenue},${trend.count}\n`;
      });
      break;

    case "users":
      csvContent = "Period,New Users\n";
      data.registrationTrends.forEach(trend => {
        csvContent += `${trend.period},${trend.count}\n`;
      });
      break;

    case "courses":
      csvContent = "Course,Enrollments,Completion Rate,Average Rating,Revenue\n";
      data.courses.forEach(course => {
        csvContent += `"${course.title}",${course.enrollmentCount},${course.completionRate}%,${course.averageRating || "N/A"},${course.totalRevenue}\n`;
      });
      break;

    default:
      const error = new Error("Invalid report type");
      error.statusCode = 400;
      throw error;
  }

  return csvContent;
};
