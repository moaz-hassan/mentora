import paymentRepository from "../../repositories/payments/payment.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";
import userRepository from "../../repositories/auth/user.repository.js";
import Payment from "../../models/payments/payment.model.js";
import Course from "../../models/courses/course.model.js";
import User from "../../models/auth/user.model.js";

export const getFinancialOverview = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;

  const matchClause = { status: "completed" };
  if (startDate || endDate) {
    matchClause.createdAt = {};
    if (startDate) matchClause.createdAt.$gte = new Date(startDate);
    if (endDate) matchClause.createdAt.$lte = new Date(endDate);
  }

  const [revAgg] = await Payment.aggregate([
    { $match: matchClause },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  const totalRevenue = revAgg?.totalRevenue || 0;
  const transactionCount = revAgg?.count || 0;

  const commissionRate = 0.20;
  const platformCommission = totalRevenue * commissionRate;
  const instructorEarnings = totalRevenue * (1 - commissionRate);
  const pendingPayouts = instructorEarnings;
  const completedPayouts = 0;

  const avgTransactionValue = transactionCount > 0 
    ? (totalRevenue / transactionCount).toFixed(2)
    : 0;

  return {
    totalRevenue: parseFloat(totalRevenue).toFixed(2),
    platformCommission: parseFloat(platformCommission).toFixed(2),
    instructorEarnings: parseFloat(instructorEarnings).toFixed(2),
    pendingPayouts: parseFloat(pendingPayouts).toFixed(2),
    completedPayouts: parseFloat(completedPayouts).toFixed(2),
    transactionCount,
    avgTransactionValue: parseFloat(avgTransactionValue)
  };
};

export const getRevenueBreakdown = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;

  const matchClause = { status: "completed" };
  if (startDate || endDate) {
    matchClause.createdAt = {};
    if (startDate) matchClause.createdAt.$gte = new Date(startDate);
    if (endDate) matchClause.createdAt.$lte = new Date(endDate);
  }

  const courseAgg = await Payment.aggregate([
    { $match: matchClause },
    { $group: { _id: "$course_id", revenue: { $sum: "$amount" }, sales: { $sum: 1 } } },
    { $sort: { revenue: -1 } }
  ]);

  const byCourse = await Promise.all(
    courseAgg.map(async (item) => {
      const course = await Course.findById(item._id).select("title instructor_id price").lean();
      return {
        courseId: item._id,
        courseTitle: course?.title || "Unknown Course",
        instructorId: course?.instructor_id,
        revenue: parseFloat(item.revenue || 0).toFixed(2),
        sales: item.sales || 0
      };
    })
  );

  // Group by instructor
  const instructorMap = {};
  for (const item of byCourse) {
    const instId = item.instructorId?.toString();
    if (!instId) continue;
    if (!instructorMap[instId]) {
      const instructor = await User.findById(instId).select("first_name last_name email").lean();
      instructorMap[instId] = {
        instructorId: instId,
        instructorName: instructor ? `${instructor.first_name} ${instructor.last_name}` : "Unknown Instructor",
        revenue: 0,
        sales: 0
      };
    }
    instructorMap[instId].revenue += parseFloat(item.revenue);
    instructorMap[instId].sales += item.sales;
  }

  const byInstructor = Object.values(instructorMap)
    .sort((a, b) => b.revenue - a.revenue)
    .map(i => ({ ...i, revenue: i.revenue.toFixed(2) }));

  return {
    byCourse,
    byInstructor
  };
};

export const getInstructorPayouts = async (instructorId = null) => {
  const matchClause = { status: "completed" };

  let courseIds = null;
  if (instructorId) {
    const courses = await Course.find({ instructor_id: instructorId }).select("_id").lean();
    courseIds = courses.map(c => c._id.toString());
    matchClause.course_id = { $in: courseIds };
  }

  const payments = await Payment.find(matchClause).lean();

  const payoutsByInstructor = {};

  for (const payment of payments) {
    const course = await Course.findById(payment.course_id).select("title instructor_id").lean();
    if (!course || !course.instructor_id) continue;

    const instId = course.instructor_id.toString();
    if (!payoutsByInstructor[instId]) {
      const instructor = await User.findById(instId).select("first_name last_name email").lean();
      payoutsByInstructor[instId] = {
        instructorId: instId,
        instructorName: instructor ? `${instructor.first_name} ${instructor.last_name}` : "Unknown",
        email: instructor?.email || "",
        totalEarnings: 0,
        pendingAmount: 0,
        paidAmount: 0,
        transactionCount: 0
      };
    }

    const commissionRate = 0.20;
    const instructorEarning = (payment.amount || 0) * (1 - commissionRate);

    payoutsByInstructor[instId].totalEarnings += instructorEarning;
    payoutsByInstructor[instId].pendingAmount += instructorEarning;
    payoutsByInstructor[instId].transactionCount += 1;
  }

  return Object.values(payoutsByInstructor).map(payout => ({
    ...payout,
    totalEarnings: parseFloat(payout.totalEarnings).toFixed(2),
    pendingAmount: parseFloat(payout.pendingAmount).toFixed(2),
    paidAmount: parseFloat(payout.paidAmount).toFixed(2)
  }));
};

export const getTransactionHistory = async (filters = {}) => {
  const filterClause = {};

  if (filters.status) filterClause.status = filters.status;
  if (filters.courseId) filterClause.course_id = filters.courseId;
  if (filters.studentId) filterClause.student_id = filters.studentId;

  if (filters.startDate || filters.endDate) {
    filterClause.createdAt = {};
    if (filters.startDate) filterClause.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) filterClause.createdAt.$lte = new Date(filters.endDate);
  }

  const limit = filters.limit || 100;
  const transactions = await Payment.find(filterClause)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return await Promise.all(
    transactions.map(async (transaction) => {
      const course = await Course.findById(transaction.course_id).select("title instructor_id").lean();
      const student = await User.findById(transaction.student_id).select("first_name last_name email").lean();

      return {
        id: transaction._id?.toString() || transaction.id,
        amount: parseFloat(transaction.amount || 0).toFixed(2),
        status: transaction.status,
        paymentMethod: transaction.payment_method,
        courseTitle: course?.title || "Unknown Course",
        studentName: student ? `${student.first_name} ${student.last_name}` : "Unknown Student",
        studentEmail: student?.email || "",
        createdAt: transaction.createdAt || transaction.created_at
      };
    })
  );
};

export const exportFinancialData = async (dateRange = {}) => {
  const overview = await getFinancialOverview(dateRange);
  const breakdown = await getRevenueBreakdown(dateRange);
  const payouts = await getInstructorPayouts();
  const transactions = await getTransactionHistory({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 1000
  });

  return {
    overview,
    breakdown,
    payouts,
    transactions,
    exportedAt: new Date().toISOString(),
    dateRange
  };
};
