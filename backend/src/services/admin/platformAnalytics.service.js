import {
  Enrollment,
  Payment,
  User,
  Course,
  Ratings
} from "../../models/index.js";

const getMongoDateFormat = (groupBy) => {
  switch (groupBy) {
    case "hour":
      return "%Y-%m-%d %H:00:00";
    case "day":
      return "%Y-%m-%d";
    case "week":
      return "%Y-%U";
    case "month":
      return "%Y-%m";
    default:
      return "%Y-%m-%d";
  }
};

export const getEnrollmentAnalytics = async (filters = {}) => {
  const { startDate, endDate, courseId, groupBy = "day" } = filters;

  const query = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (courseId) query.course_id = courseId;

  const totalEnrollments = await Enrollment.countDocuments(query);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newEnrollmentsQuery = {
    ...query,
    createdAt: {
      $gte: startDate ? new Date(startDate) : thirtyDaysAgo
    }
  };
  const newEnrollments = await Enrollment.countDocuments(newEnrollmentsQuery);

  const allEnrollments = await Enrollment.find(query).select("_id progress updatedAt").lean();

  const completedEnrollments = allEnrollments.filter(e => {
    const progress = typeof e.progress === "string" ? JSON.parse(e.progress) : e.progress;
    return progress && (progress.completionPercentage === 100 || progress.progress_percentage === 100);
  }).length;

  const completionRate = totalEnrollments > 0
    ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
    : 0;

  const inactiveEnrollments = allEnrollments.filter(e => {
    const progress = typeof e.progress === "string" ? JSON.parse(e.progress) : e.progress;
    const lastActive = progress?.lastAccessed || e.updatedAt;
    if (!lastActive) return true;
    return new Date(lastActive) < thirtyDaysAgo;
  }).length;

  const dateFormat = getMongoDateFormat(groupBy);

  const trends = await Enrollment.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const topCoursesAgg = await Enrollment.aggregate([
    { $match: query },
    { $group: { _id: "$course_id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const topCourses = await Promise.all(
    topCoursesAgg.map(async (item) => {
      const course = await Course.findById(item._id).select("title").lean();
      return {
        courseId: item._id,
        courseTitle: course?.title || "Unknown",
        enrollmentCount: item.count
      };
    })
  );

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
      period: t._id,
      count: t.count
    })),
    topCourses,
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
      groupBy
    }
  };
};

export const getPaymentAnalytics = async (filters = {}) => {
  const { startDate, endDate, status, groupBy = "day" } = filters;

  const query = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (status) query.status = status;

  const [revData] = await Payment.aggregate([
    { $match: { ...query, status: "completed" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalPayments: { $sum: 1 }
      }
    }
  ]);

  const totalRevenue = parseFloat(revData?.totalRevenue || 0);
  const totalPayments = parseInt(revData?.totalPayments || 0);

  const totalAttempts = await Payment.countDocuments(query);
  const successfulPayments = await Payment.countDocuments({ ...query, status: "completed" });
  const successRate = totalAttempts > 0
    ? ((successfulPayments / totalAttempts) * 100).toFixed(1)
    : 0;

  const [refundData] = await Payment.aggregate([
    { $match: { ...query, status: "refunded" } },
    {
      $group: {
        _id: null,
        totalRefunded: { $sum: "$amount" },
        refundCount: { $sum: 1 }
      }
    }
  ]);

  const totalRefunded = parseFloat(refundData?.totalRefunded || 0);
  const refundCount = parseInt(refundData?.refundCount || 0);
  const refundRate = totalPayments > 0
    ? ((refundCount / totalPayments) * 100).toFixed(1)
    : 0;

  const byPaymentMethod = await Payment.aggregate([
    { $match: { ...query, status: "completed" } },
    {
      $group: {
        _id: "$payment_method",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  const dateFormat = getMongoDateFormat(groupBy);

  const revenueTrends = await Payment.aggregate([
    { $match: { ...query, status: "completed" } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

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
      method: pm._id || "unknown",
      count: pm.count,
      totalAmount: parseFloat(pm.totalAmount || 0),
      percentage: totalPayments > 0
        ? ((pm.count / totalPayments) * 100).toFixed(1)
        : 0
    })),
    trends: revenueTrends.map(t => ({
      period: t._id,
      revenue: parseFloat(t.revenue || 0),
      count: t.count
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

  const query = { is_active: true };
  if (role) query.role = role;

  const totalActiveUsers = await User.countDocuments(query);

  const registrationQuery = { ...query };
  if (startDate || endDate) {
    registrationQuery.createdAt = {};
    if (startDate) registrationQuery.createdAt.$gte = new Date(startDate);
    if (endDate) registrationQuery.createdAt.$lte = new Date(endDate);
  }

  const newRegistrations = await User.countDocuments(registrationQuery);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const activeLastWeek = await User.countDocuments({
    ...query,
    updatedAt: { $gte: sevenDaysAgo }
  });

  const activeLastMonth = await User.countDocuments({
    ...query,
    updatedAt: { $gte: thirtyDaysAgo }
  });

  const retentionRate = totalActiveUsers > 0
    ? ((activeLastMonth / totalActiveUsers) * 100).toFixed(1)
    : 0;

  const dateFormat = getMongoDateFormat(groupBy);

  const registrationTrends = await User.aggregate([
    { $match: registrationQuery },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const byRole = await User.aggregate([
    { $match: query },
    { $group: { _id: "$role", count: { $sum: 1 } } }
  ]);

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
      period: t._id,
      count: t.count
    })),
    usersByRole: byRole.map(r => ({
      role: r._id,
      count: r.count,
      percentage: totalActiveUsers > 0
        ? ((r.count / totalActiveUsers) * 100).toFixed(1)
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

  const query = { status: { $in: ["published", "approved"] } };
  if (instructorId) query.instructor_id = instructorId;

  const courses = await Course.find(query).limit(parseInt(limit)).lean();

  const coursePerformance = await Promise.all(
    courses.map(async (course) => {
      const courseId = course._id.toString();

      const enrFilter = { course_id: courseId };
      if (startDate || endDate) {
        enrFilter.createdAt = {};
        if (startDate) enrFilter.createdAt.$gte = new Date(startDate);
        if (endDate) enrFilter.createdAt.$lte = new Date(endDate);
      }

      const totalEnrollments = await Enrollment.countDocuments(enrFilter);

      const enrollments = await Enrollment.find(enrFilter).select("progress").lean();
      const completedEnrollments = enrollments.filter(e => {
        const progress = typeof e.progress === "string" ? JSON.parse(e.progress) : e.progress;
        return progress && (progress.completionPercentage === 100 || progress.progress_percentage === 100);
      }).length;

      const completionRate = totalEnrollments > 0
        ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
        : 0;

      const [ratingAgg] = await Ratings.aggregate([
        { $match: { course_id: courseId } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
      ]);

      const [paymentAgg] = await Payment.aggregate([
        { $match: { course_id: courseId, status: "completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
      ]);

      let instructor = null;
      if (course.instructor_id) {
        const inst = await User.findById(course.instructor_id).select("first_name last_name").lean();
        if (inst) {
          instructor = {
            id: inst._id.toString(),
            name: `${inst.first_name} ${inst.last_name}`
          };
        }
      }

      const totalRevenue = paymentAgg?.totalRevenue || 0;

      return {
        courseId,
        title: course.title,
        price: course.price,
        instructor,
        enrollmentCount: totalEnrollments,
        completionRate: parseFloat(completionRate),
        averageRating: ratingAgg?.avgRating ? parseFloat(ratingAgg.avgRating.toFixed(1)) : null,
        reviewCount: ratingAgg?.count || 0,
        totalRevenue: parseFloat(totalRevenue),
        revenuePerEnrollment: totalEnrollments > 0
          ? (totalRevenue / totalEnrollments).toFixed(2)
          : 0
      };
    })
  );

  coursePerformance.sort((a, b) => b.enrollmentCount - a.enrollmentCount);

  const totalCourses = await Course.countDocuments(query);
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
    case "monthly": {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    }
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
