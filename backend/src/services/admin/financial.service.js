

import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const { Payment, Course, User, Enrollment } = models;


export const getFinancialOverview = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;
  
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = new Date(startDate);
  if (endDate) dateFilter[Op.lte] = new Date(endDate);

  const whereClause = {
    status: "completed",
    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
  };

  
  const totalRevenue = await Payment.sum("amount", { where: whereClause });

  
  const commissionRate = 0.20;
  const platformCommission = totalRevenue * commissionRate;
  const instructorEarnings = totalRevenue * (1 - commissionRate);

  
  const pendingPayouts = instructorEarnings; 

  
  const completedPayouts = 0; 

  
  const transactionCount = await Payment.count({ where: whereClause });

  
  const avgTransactionValue = transactionCount > 0 
    ? (totalRevenue / transactionCount).toFixed(2)
    : 0;

  return {
    totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
    platformCommission: parseFloat(platformCommission || 0).toFixed(2),
    instructorEarnings: parseFloat(instructorEarnings || 0).toFixed(2),
    pendingPayouts: parseFloat(pendingPayouts || 0).toFixed(2),
    completedPayouts: parseFloat(completedPayouts).toFixed(2),
    transactionCount,
    avgTransactionValue: parseFloat(avgTransactionValue)
  };
};


export const getRevenueBreakdown = async (dateRange = {}) => {
  const { startDate, endDate } = dateRange;
  
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = new Date(startDate);
  if (endDate) dateFilter[Op.lte] = new Date(endDate);

  const whereClause = {
    status: "completed",
    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
  };

  
  const revenueByCourse = await Payment.findAll({
    where: whereClause,
    attributes: [
      "course_id",
      [fn("SUM", col("amount")), "revenue"],
      [fn("COUNT", col("Payment.id")), "sales"]
    ],
    group: ["course_id"],
    include: [{
      model: Course,
      attributes: ["title", "instructor_id", "price"]
    }],
    order: [[literal("revenue"), "DESC"]],
    raw: true
  });

  
  const revenueByInstructor = await Payment.findAll({
    where: whereClause,
    attributes: [
      [col("Course.instructor_id"), "instructor_id"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("COUNT", col("Payment.id")), "sales"]
    ],
    include: [{
      model: Course,
      attributes: [],
      include: [{
        model: User,
        as: "Instructor",
        attributes: ["first_name", "last_name", "email"]
      }]
    }],
    group: ["Course.instructor_id"],
    order: [[literal("revenue"), "DESC"]],
    raw: true
  });

  return {
    byCourse: revenueByCourse.map(item => ({
      courseId: item.course_id,
      courseTitle: item["Course.title"],
      instructorId: item["Course.instructor_id"],
      revenue: parseFloat(item.revenue).toFixed(2),
      sales: parseInt(item.sales)
    })),
    byInstructor: revenueByInstructor.map(item => ({
      instructorId: item.instructor_id,
      instructorName: `${item["Course.Instructor.first_name"]} ${item["Course.Instructor.last_name"]}`,
      revenue: parseFloat(item.revenue).toFixed(2),
      sales: parseInt(item.sales)
    }))
  };
};


export const getInstructorPayouts = async (instructorId = null) => {
  const whereClause = { status: "completed" };
  
  if (instructorId) {
    const courses = await Course.findAll({
      where: { instructor_id: instructorId },
      attributes: ["id"]
    });
    whereClause.course_id = courses.map(c => c.id);
  }

  const payments = await Payment.findAll({
    where: whereClause,
    include: [{
      model: Course,
      attributes: ["title", "instructor_id"],
      include: [{
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name", "email"]
      }]
    }]
  });

  
  const payoutsByInstructor = {};
  
  payments.forEach(payment => {
    const instructorId = payment.Course.instructor_id;
    if (!payoutsByInstructor[instructorId]) {
      payoutsByInstructor[instructorId] = {
        instructorId,
        instructorName: `${payment.Course.Instructor.first_name} ${payment.Course.Instructor.last_name}`,
        email: payment.Course.Instructor.email,
        totalEarnings: 0,
        pendingAmount: 0,
        paidAmount: 0,
        transactionCount: 0
      };
    }
    
    const commissionRate = 0.20;
    const instructorEarning = payment.amount * (1 - commissionRate);
    
    payoutsByInstructor[instructorId].totalEarnings += instructorEarning;
    payoutsByInstructor[instructorId].pendingAmount += instructorEarning;
    payoutsByInstructor[instructorId].transactionCount += 1;
  });

  return Object.values(payoutsByInstructor).map(payout => ({
    ...payout,
    totalEarnings: parseFloat(payout.totalEarnings).toFixed(2),
    pendingAmount: parseFloat(payout.pendingAmount).toFixed(2),
    paidAmount: parseFloat(payout.paidAmount).toFixed(2)
  }));
};


export const getTransactionHistory = async (filters = {}) => {
  const whereClause = {};
  
  if (filters.status) whereClause.status = filters.status;
  if (filters.courseId) whereClause.course_id = filters.courseId;
  if (filters.studentId) whereClause.student_id = filters.studentId;
  
  if (filters.startDate || filters.endDate) {
    whereClause.created_at = {};
    if (filters.startDate) whereClause.created_at[Op.gte] = new Date(filters.startDate);
    if (filters.endDate) whereClause.created_at[Op.lte] = new Date(filters.endDate);
  }

  const transactions = await Payment.findAll({
    where: whereClause,
    include: [
      {
        model: Course,
        attributes: ["title", "instructor_id"]
      },
      {
        model: User,
        as: "Student",
        attributes: ["first_name", "last_name", "email"]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: filters.limit || 100
  });

  return transactions.map(transaction => ({
    id: transaction.id,
    amount: parseFloat(transaction.amount).toFixed(2),
    status: transaction.status,
    paymentMethod: transaction.payment_method,
    courseTitle: transaction.Course.title,
    studentName: `${transaction.Student.first_name} ${transaction.Student.last_name}`,
    studentEmail: transaction.Student.email,
    createdAt: transaction.created_at
  }));
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
