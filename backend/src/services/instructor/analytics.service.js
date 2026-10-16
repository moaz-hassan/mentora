import {
  Course,
  Enrollment,
  Payment,
  Ratings,
  User,
  Lesson,
  Quiz,
  QuizResult,
  ChatMessage,
  Chapter,
  ChatRoom,
} from "../../models/index.js";

export const getInstructorOverview = async (instructorId) => {
  const courses = await Course.find({ instructor_id: instructorId.toString() }).select("_id").lean();
  const courseIds = courses.map((c) => c._id.toString());

  if (courseIds.length === 0) {
    return {
      total_students: 0,
      total_earnings: "0.00",
      course_count: 0,
      average_rating: null,
      recent_enrollments: 0,
    };
  }

  const distinctStudents = await Enrollment.distinct("student_id", {
    course_id: { $in: courseIds },
  });
  const totalStudents = distinctStudents.length;

  const [earningsResult] = await Payment.aggregate([
    { $match: { course_id: { $in: courseIds }, status: "completed" } },
    { $group: { _id: null, totalEarnings: { $sum: "$amount" } } },
  ]);
  const totalEarnings = earningsResult?.totalEarnings || 0;

  const courseCount = courses.length;

  const [ratingResult] = await Ratings.aggregate([
    { $match: { course_id: { $in: courseIds } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  const averageRating = ratingResult?.avgRating
    ? parseFloat(ratingResult.avgRating.toFixed(1))
    : null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEnrollments = await Enrollment.countDocuments({
    course_id: { $in: courseIds },
    createdAt: { $gte: thirtyDaysAgo },
  });

  return {
    total_students: totalStudents,
    total_earnings: parseFloat(totalEarnings).toFixed(2),
    course_count: courseCount,
    average_rating: averageRating,
    recent_enrollments: recentEnrollments,
  };
};

export const getCourseAnalytics = async (courseId, instructorId) => {
  const course = await Course.findById(courseId).lean();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id?.toString() !== instructorId.toString()) {
    const error = new Error("You do not have permission to view analytics for this course");
    error.statusCode = 403;
    throw error;
  }

  const courseIdStr = course._id.toString();

  const totalEnrollments = await Enrollment.countDocuments({ course_id: courseIdStr });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const enrollments = await Enrollment.find({ course_id: courseIdStr }).select("progress updatedAt").lean();

  let activeStudents = 0;
  let completedCourses = 0;
  let totalCompletionPercentage = 0;

  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : enrollment.updatedAt ? new Date(enrollment.updatedAt) : null;

    if (lastAccessed && lastAccessed >= thirtyDaysAgo) {
      activeStudents++;
    }

    const pct = progress.completionPercentage || progress.progress_percentage || 0;
    if (pct === 100) {
      completedCourses++;
    }

    totalCompletionPercentage += pct;
  });

  const averageCompletionRate =
    enrollments.length > 0
      ? (totalCompletionPercentage / enrollments.length).toFixed(1)
      : 0;

  const completionRate =
    totalEnrollments > 0
      ? ((completedCourses / totalEnrollments) * 100).toFixed(1)
      : 0;

  const chapters = await Chapter.find({ course_id: courseIdStr }).select("_id").lean();
  const chapterIds = chapters.map(ch => ch._id.toString());
  const quizzes = await Quiz.find({ chapter_id: { $in: chapterIds } }).select("_id").lean();
  const quizIds = quizzes.map(q => q._id.toString());

  let averageQuizScore = null;
  if (quizIds.length > 0) {
    const [quizAgg] = await QuizResult.aggregate([
      { $match: { quiz_id: { $in: quizIds } } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);
    if (quizAgg?.avgScore !== undefined) {
      averageQuizScore = parseFloat(quizAgg.avgScore.toFixed(1));
    }
  }

  const chatRooms = await ChatRoom.find({ course_id: courseIdStr, type: "group" }).select("_id").lean();
  const chatRoomIds = chatRooms.map((r) => r._id.toString());

  let totalMessages = 0;
  let uniqueMessageSenders = 0;
  if (chatRoomIds.length > 0) {
    totalMessages = await ChatMessage.countDocuments({ room_id: { $in: chatRoomIds } });
    const distinctSenders = await ChatMessage.distinct("sender_id", { room_id: { $in: chatRoomIds } });
    uniqueMessageSenders = distinctSenders.length;
  }

  const chatParticipationRate =
    totalEnrollments > 0
      ? ((uniqueMessageSenders / totalEnrollments) * 100).toFixed(1)
      : 0;

  return {
    course_id: courseIdStr,
    course_title: course.title,
    total_enrollments: totalEnrollments,
    active_students: activeStudents,
    completion_rate: parseFloat(completionRate),
    average_completion_percentage: parseFloat(averageCompletionRate),
    average_quiz_score: averageQuizScore,
    engagement: {
      total_messages: totalMessages,
      chat_participation_rate: parseFloat(chatParticipationRate),
    },
  };
};

export const getRevenueAnalytics = async (instructorId, startDate, endDate) => {
  const courses = await Course.find({ instructor_id: instructorId.toString() }).select("_id title").lean();
  const courseIds = courses.map((c) => c._id.toString());

  if (courseIds.length === 0) {
    return {
      total_revenue: "0.00",
      revenue_by_course: [],
      revenue_by_month: [],
      refund_rate: 0,
      average_transaction_value: 0,
    };
  }

  const matchQuery = {
    course_id: { $in: courseIds },
    status: "completed",
  };

  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const [revAgg] = await Payment.aggregate([
    { $match: matchQuery },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revAgg?.totalRevenue || 0;

  const revByCourseAgg = await Payment.aggregate([
    { $match: matchQuery },
    { $group: { _id: "$course_id", revenue: { $sum: "$amount" }, sales: { $sum: 1 } } },
  ]);

  const revenueByCourse = await Promise.all(
    revByCourseAgg.map(async (item) => {
      const course = courses.find((c) => c._id.toString() === item._id) ||
        (await Course.findById(item._id).select("title").lean());
      return {
        course_id: item._id,
        course_title: course?.title || "Unknown Course",
        revenue: parseFloat(item.revenue || 0).toFixed(2),
        sales: item.sales,
      };
    })
  );

  const revenueByMonthAgg = await Payment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$amount" },
        sales: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const revenueByMonth = revenueByMonthAgg.map((item) => ({
    month: item._id,
    revenue: parseFloat(item.revenue || 0).toFixed(2),
    sales: item.sales,
  }));

  const totalPayments = await Payment.countDocuments({ course_id: { $in: courseIds } });
  const refundedPayments = await Payment.countDocuments({
    course_id: { $in: courseIds },
    status: "refunded",
  });

  const refundRate =
    totalPayments > 0 ? ((refundedPayments / totalPayments) * 100).toFixed(1) : 0;

  const averageTransactionValue =
    totalPayments > 0 ? (totalRevenue / totalPayments).toFixed(2) : 0;

  return {
    total_revenue: parseFloat(totalRevenue).toFixed(2),
    revenue_by_course: revenueByCourse,
    revenue_by_month: revenueByMonth,
    refund_rate: parseFloat(refundRate),
    average_transaction_value: parseFloat(averageTransactionValue),
  };
};

export const getEngagementMetrics = async (instructorId, days = 30) => {
  const courses = await Course.find({ instructor_id: instructorId.toString() }).select("_id").lean();
  const courseIds = courses.map((c) => c._id.toString());

  if (courseIds.length === 0) {
    return {
      period_days: days,
      active_students_by_day: [],
      chat_participation_rate: 0,
      average_session_duration_minutes: 0,
      total_students: 0,
    };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const enrollments = await Enrollment.find({ course_id: { $in: courseIds } }).select("progress updatedAt").lean();

  const activeStudentsByDay = {};
  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : enrollment.updatedAt ? new Date(enrollment.updatedAt) : null;

    if (lastAccessed && lastAccessed >= startDate) {
      const dateKey = lastAccessed.toISOString().split("T")[0];
      activeStudentsByDay[dateKey] = (activeStudentsByDay[dateKey] || 0) + 1;
    }
  });

  const chatRooms = await ChatRoom.find({ course_id: { $in: courseIds }, type: "group" }).select("_id").lean();
  const chatRoomIds = chatRooms.map((r) => r._id.toString());

  let uniqueMessageSenders = 0;
  if (chatRoomIds.length > 0) {
    const senders = await ChatMessage.distinct("sender_id", {
      room_id: { $in: chatRoomIds },
      createdAt: { $gte: startDate },
    });
    uniqueMessageSenders = senders.length;
  }

  const totalStudents = enrollments.length;
  const chatParticipationRate =
    totalStudents > 0
      ? ((uniqueMessageSenders / totalStudents) * 100).toFixed(1)
      : 0;

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

export const exportAnalyticsData = async (instructorId, startDate, endDate) => {
  const overview = await getInstructorOverview(instructorId);
  const revenue = await getRevenueAnalytics(instructorId, startDate, endDate);
  const engagement = await getEngagementMetrics(instructorId, 30);

  return {
    overview,
    revenue,
    engagement,
    exported_at: new Date().toISOString(),
  };
};

export const getEnrollmentTrendWithGrouping = async (instructorId, days = 30, groupBy = "day") => {
  const courses = await Course.find({ instructor_id: instructorId.toString() }).select("_id").lean();
  const courseIds = courses.map((c) => c._id.toString());

  if (courseIds.length === 0) {
    return { enrollments: [] };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const enrollments = await Enrollment.find({
    course_id: { $in: courseIds },
    createdAt: { $gte: startDate },
  })
    .select("createdAt enrolled_at")
    .sort({ createdAt: 1 })
    .lean();

  const groupedData = {};

  enrollments.forEach((enrollment) => {
    const enrollDate = new Date(enrollment.enrolled_at || enrollment.createdAt);
    let key;

    if (groupBy === "day") {
      key = enrollDate.toISOString().split("T")[0];
    } else if (groupBy === "week") {
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksDiff = Math.floor((enrollDate - startDate) / msPerWeek);
      key = `Week ${weeksDiff + 1}`;
    } else if (groupBy === "month") {
      key = `${enrollDate.getFullYear()}-${String(enrollDate.getMonth() + 1).padStart(2, "0")}`;
    } else {
      key = enrollDate.toISOString().split("T")[0];
    }

    groupedData[key] = (groupedData[key] || 0) + 1;
  });

  const trend = Object.entries(groupedData).map(([date, count]) => ({
    date,
    enrollments: count,
  }));

  return { enrollments: trend };
};

const anonymizeStudentData = (data, anonymize) => {
  if (!anonymize) return data;

  const anonymizeStudent = (student, index) => {
    if (!student) return student;
    return {
      ...student,
      first_name: "Student",
      last_name: `#${index + 1}`,
      full_name: `Student #${index + 1}`,
      email: `student${index + 1}@anonymous.com`,
    };
  };

  const anonymizedData = JSON.parse(JSON.stringify(data));

  if (anonymizedData.students && Array.isArray(anonymizedData.students)) {
    anonymizedData.students = anonymizedData.students.map((student, index) =>
      anonymizeStudent(student, index)
    );
  }

  return anonymizedData;
};

export const generateComprehensiveReport = async (
  instructorId,
  startDate,
  endDate,
  courseIds = null,
  anonymizeStudents = true
) => {
  const courseFilter = {
    instructor_id: instructorId.toString(),
    status: { $in: ["approved", "published"] },
  };

  if (courseIds && courseIds.length > 0) {
    courseFilter._id = { $in: courseIds };
  }

  const courses = await Course.find(courseFilter)
    .select("_id title thumbnail_url description price")
    .lean();

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

  const courseIdsArray = courses.map((c) => c._id.toString());

  const enrFilter = { course_id: { $in: courseIdsArray } };
  if (startDate || endDate) {
    enrFilter.createdAt = {};
    if (startDate) enrFilter.createdAt.$gte = new Date(startDate);
    if (endDate) enrFilter.createdAt.$lte = new Date(endDate);
  }

  const enrollments = await Enrollment.find(enrFilter).select("_id progress student_id course_id updatedAt").lean();
  const totalEnrollments = enrollments.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let activeStudents = 0;
  let completedCount = 0;

  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : enrollment.updatedAt ? new Date(enrollment.updatedAt) : null;

    if (lastAccessed && lastAccessed >= thirtyDaysAgo) {
      activeStudents++;
    }

    const pct = progress.completionPercentage || progress.progress_percentage || 0;
    if (pct === 100) {
      completedCount++;
    }
  });

  const completionRate =
    totalEnrollments > 0
      ? parseFloat(((completedCount / totalEnrollments) * 100).toFixed(1))
      : 0;

  const [ratingResult] = await Ratings.aggregate([
    { $match: { course_id: { $in: courseIdsArray } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  const averageRating = ratingResult?.avgRating
    ? parseFloat(ratingResult.avgRating.toFixed(1))
    : 0;

  const revenueWhereClause = {
    course_id: { $in: courseIdsArray },
    status: "completed",
  };
  if (startDate || endDate) {
    revenueWhereClause.createdAt = {};
    if (startDate) revenueWhereClause.createdAt.$gte = new Date(startDate);
    if (endDate) revenueWhereClause.createdAt.$lte = new Date(endDate);
  }

  const [revSumAgg] = await Payment.aggregate([
    { $match: revenueWhereClause },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revSumAgg?.totalRevenue || 0;

  const revByCourseAgg = await Payment.aggregate([
    { $match: revenueWhereClause },
    { $group: { _id: "$course_id", revenue: { $sum: "$amount" }, sales: { $sum: 1 } } },
  ]);

  const revenueByCourse = revByCourseAgg.map((item) => {
    const c = courses.find((course) => course._id.toString() === item._id);
    return {
      course_id: item._id,
      course_title: c?.title || "Unknown Course",
      course_price: c?.price,
      revenue: parseFloat(item.revenue || 0).toFixed(2),
      sales: item.sales,
    };
  });

  const revByMonthAgg = await Payment.aggregate([
    { $match: revenueWhereClause },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$amount" },
        sales: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const revenueByMonth = revByMonthAgg.map((item) => ({
    month: item._id,
    revenue: parseFloat(item.revenue || 0).toFixed(2),
    sales: item.sales,
  }));

  const enrollmentTrendData = await getEnrollmentTrendWithGrouping(
    instructorId,
    endDate && startDate
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 30,
    "day"
  );

  const chatRooms = await ChatRoom.find({
    course_id: { $in: courseIdsArray },
    type: "group",
  }).select("_id").lean();
  const chatRoomIds = chatRooms.map((r) => r._id.toString());

  let chatParticipation = 0;
  if (chatRoomIds.length > 0) {
    const uniqueSenders = await ChatMessage.distinct("sender_id", {
      room_id: { $in: chatRoomIds },
    });
    chatParticipation =
      totalEnrollments > 0
        ? parseFloat(((uniqueSenders.length / totalEnrollments) * 100).toFixed(1))
        : 0;
  }

  const chapters = await Chapter.find({ course_id: { $in: courseIdsArray } }).select("_id").lean();
  const chapterIds = chapters.map((ch) => ch._id.toString());
  const quizzes = await Quiz.find({ chapter_id: { $in: chapterIds } }).select("_id").lean();
  const quizIds = quizzes.map((q) => q._id.toString());

  let quizAnalytics = {
    averageScore: 0,
    passRate: 0,
    totalAttempts: 0,
  };

  if (quizIds.length > 0) {
    const quizResults = await QuizResult.find({ quiz_id: { $in: quizIds } }).select("score").lean();
    const totalAttempts = quizResults.length;

    if (totalAttempts > 0) {
      const totalScore = quizResults.reduce((sum, result) => sum + (result.score || 0), 0);
      const averageScore = parseFloat((totalScore / totalAttempts).toFixed(1));
      const passCount = quizResults.filter((result) => (result.score || 0) >= 60).length;
      const passRate = parseFloat(((passCount / totalAttempts) * 100).toFixed(1));

      quizAnalytics = {
        averageScore,
        passRate,
        totalAttempts,
      };
    }
  }

  let reportData = {
    overview: {
      totalEnrollments,
      activeStudents,
      completionRate,
      averageRating,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    },
    courses: courses.map((course) => {
      const cId = course._id.toString();
      const courseRevenue = revenueByCourse.find((r) => r.course_id === cId);
      const courseEnrollments = enrollments.filter((e) => e.course_id === cId);

      return {
        id: cId,
        title: course.title,
        thumbnail_url: course.thumbnail_url,
        description: course.description,
        price: course.price,
        enrollments: courseEnrollments.length,
        revenue: courseRevenue ? parseFloat(courseRevenue.revenue).toFixed(2) : "0.00",
        sales: courseRevenue ? parseInt(courseRevenue.sales) : 0,
      };
    }),
    revenue: {
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      revenue_by_course: revenueByCourse,
      revenue_by_month: revenueByMonth,
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

  if (anonymizeStudents) {
    reportData = anonymizeStudentData(reportData, true);
  }

  return reportData;
};
