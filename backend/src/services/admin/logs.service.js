

import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const { AuditLog, PaymentLog, EnrollmentLog, ErrorLog, ModerationLog, NotificationLog, User, Course } = models;


export const getAuditLogs = async (filters = {}) => {
  const {
    adminId,
    actionType,
    resourceType,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50
  } = filters;

  const whereClause = {};

  if (adminId) whereClause.admin_id = adminId;
  if (actionType) whereClause.action_type = actionType;
  if (resourceType) whereClause.resource_type = resourceType;

  
  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
    if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
  }

  
  if (search) {
    whereClause[Op.or] = [
      { action_type: { [Op.like]: `%${search}%` } },
      { resource_type: { [Op.like]: `%${search}%` } },
      { resource_id: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await AuditLog.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "Admin",
        attributes: ["id", "first_name", "last_name", "email"]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    logs: rows.map(log => ({
      id: log.id,
      admin: log.Admin ? {
        id: log.Admin.id,
        name: `${log.Admin.first_name} ${log.Admin.last_name}`,
        email: log.Admin.email
      } : null,
      actionType: log.action_type,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      description: log.description,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      status: log.status,
      metadata: log.metadata,
      createdAt: log.created_at
    })),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};


export const getPaymentLogs = async (filters = {}) => {
  const {
    userId,
    courseId,
    status,
    paymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    page = 1,
    limit = 50
  } = filters;

  const whereClause = {};

  if (userId) whereClause.student_id = userId;
  if (courseId) whereClause.course_id = courseId;
  if (status) whereClause.payment_status = status;
  if (paymentMethod) whereClause.payment_method = paymentMethod;

  
  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
    if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
  }

  
  if (minAmount || maxAmount) {
    whereClause.amount = {};
    if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
    if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
  }

  
  if (search) {
    whereClause[Op.or] = [
      { transaction_id: { [Op.like]: `%${search}%` } },
      { payment_status: { [Op.like]: `%${search}%` } },
      { payment_method: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await PaymentLog.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "Student",
        attributes: ["id", "first_name", "last_name", "email"]
      },
      {
        model: Course,
        attributes: ["id", "title", "price"]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    logs: rows.map(log => ({
      id: log.id,
      transactionId: log.transaction_id,
      user: log.Student ? {
        id: log.Student.id,
        name: `${log.Student.first_name} ${log.Student.last_name}`,
        email: log.Student.email
      } : null,
      course: log.Course ? {
        id: log.Course.id,
        title: log.Course.title,
        price: log.Course.price
      } : null,
      amount: log.amount,
      currency: log.currency,
      paymentMethod: log.payment_method,
      status: log.payment_status,
      metadata: log.gateway_response,
      createdAt: log.created_at
    })),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};


export const getEnrollmentLogs = async (filters = {}) => {
  const {
    userId,
    courseId,
    status,
    source,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50
  } = filters;

  const whereClause = {};

  if (userId) whereClause.student_id = userId;
  if (courseId) whereClause.course_id = courseId;
  if (status) whereClause.action = status;
  if (source) whereClause.enrollment_source = source;

  
  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
    if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
  }

  
  if (search) {
    whereClause[Op.or] = [
      { enrollment_id: { [Op.like]: `%${search}%` } },
      { action: { [Op.like]: `%${search}%` } },
      { enrollment_source: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await EnrollmentLog.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "Student",
        attributes: ["id", "first_name", "last_name", "email"]
      },
      {
        model: Course,
        attributes: ["id", "title"]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    logs: rows.map(log => ({
      id: log.id,
      enrollmentId: log.enrollment_id,
      user: log.Student ? {
        id: log.Student.id,
        name: `${log.Student.first_name} ${log.Student.last_name}`,
        email: log.Student.email
      } : null,
      course: log.Course ? {
        id: log.Course.id,
        title: log.Course.title
      } : null,
      status: log.action,
      source: log.enrollment_source,
      paymentStatus: log.payment_status,
      metadata: log.metadata,
      createdAt: log.created_at
    })),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};


export const getErrorLogs = async (filters = {}) => {
  const {
    severity,
    errorType,
    userId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50
  } = filters;

  const whereClause = {};

  if (severity) whereClause.severity = severity;
  if (errorType) whereClause.error_type = errorType;
  if (userId) whereClause.user_id = userId;

  
  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
    if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
  }

  
  if (search) {
    whereClause[Op.or] = [
      { error_type: { [Op.like]: `%${search}%` } },
      { error_message: { [Op.like]: `%${search}%` } },
      { endpoint: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ErrorLog.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email"],
        required: false
      }
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    logs: rows.map(log => ({
      id: log.id,
      errorType: log.error_type,
      errorMessage: log.error_message,
      stackTrace: log.stack_trace,
      severity: log.severity,
      endpoint: log.endpoint,
      method: log.method,
      user: log.User ? {
        id: log.User.id,
        name: `${log.User.first_name} ${log.User.last_name}`,
        email: log.User.email
      } : null,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      metadata: log.metadata,
      createdAt: log.created_at
    })),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};


export const exportLogs = async (logType, filters = {}) => {
  let logs = [];
  let headers = [];

  
  const exportFilters = { ...filters, limit: 10000, page: 1 };

  switch (logType) {
    case "audit":
      const auditResult = await getAuditLogs(exportFilters);
      logs = auditResult.logs;
      headers = ["ID", "Admin", "Action Type", "Resource Type", "Resource ID", "Description", "IP Address", "Status", "Created At"];
      break;

    case "payment":
      const paymentResult = await getPaymentLogs(exportFilters);
      logs = paymentResult.logs;
      headers = ["ID", "Transaction ID", "User", "Course", "Amount", "Currency", "Payment Method", "Status", "Created At"];
      break;

    case "enrollment":
      const enrollmentResult = await getEnrollmentLogs(exportFilters);
      logs = enrollmentResult.logs;
      headers = ["ID", "Enrollment ID", "User", "Course", "Status", "Source", "Payment Status", "Created At"];
      break;

    case "error":
      const errorResult = await getErrorLogs(exportFilters);
      logs = errorResult.logs;
      headers = ["ID", "Error Type", "Error Message", "Severity", "Endpoint", "Method", "User", "IP Address", "Created At"];
      break;

    default:
      const error = new Error("Invalid log type");
      error.statusCode = 400;
      throw error;
  }

  
  const csvRows = [headers.join(",")];

  logs.forEach(log => {
    const row = [];
    switch (logType) {
      case "audit":
        row.push(
          log.id,
          log.admin ? `"${log.admin.name}"` : "N/A",
          log.actionType,
          log.resourceType,
          log.resourceId || "N/A",
          `"${log.description || ""}"`,
          log.ipAddress || "N/A",
          log.status,
          log.createdAt
        );
        break;

      case "payment":
        row.push(
          log.id,
          log.transactionId,
          log.user ? `"${log.user.name}"` : "N/A",
          log.course ? `"${log.course.title}"` : "N/A",
          log.amount,
          log.currency,
          log.paymentMethod,
          log.status,
          log.createdAt
        );
        break;

      case "enrollment":
        row.push(
          log.id,
          log.enrollmentId,
          log.user ? `"${log.user.name}"` : "N/A",
          log.course ? `"${log.course.title}"` : "N/A",
          log.status,
          log.source || "N/A",
          log.paymentStatus || "N/A",
          log.createdAt
        );
        break;

      case "error":
        row.push(
          log.id,
          log.errorType,
          `"${log.errorMessage.replace(/"/g, '""')}"`,
          log.severity,
          log.endpoint || "N/A",
          log.method || "N/A",
          log.user ? `"${log.user.name}"` : "N/A",
          log.ipAddress || "N/A",
          log.createdAt
        );
        break;
    }
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
};


export const getLogAnalytics = async (filters = {}) => {
  const { startDate, endDate } = filters;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.created_at = {};
    if (startDate) dateFilter.created_at[Op.gte] = new Date(startDate);
    if (endDate) dateFilter.created_at[Op.lte] = new Date(endDate);
  }

  
  const auditStats = await AuditLog.findAll({
    where: dateFilter,
    attributes: [
      "action_type",
      [fn("COUNT", col("AuditLog.id")), "count"]
    ],
    group: ["action_type"],
    raw: true
  });

  
  const paymentStats = await PaymentLog.findAll({
    where: dateFilter,
    attributes: [
      "payment_status",
      [fn("COUNT", col("PaymentLog.id")), "count"],
      [fn("SUM", col("amount")), "totalAmount"]
    ],
    group: ["payment_status"],
    raw: true
  });

  
  const enrollmentStats = await EnrollmentLog.findAll({
    where: dateFilter,
    attributes: [
      "action",
      [fn("COUNT", col("EnrollmentLog.id")), "count"]
    ],
    group: ["action"],
    raw: true
  });

  
  const errorStats = await ErrorLog.findAll({
    where: dateFilter,
    attributes: [
      "severity",
      [fn("COUNT", col("ErrorLog.id")), "count"]
    ],
    group: ["severity"],
    raw: true
  });

  
  const activeAdmins = await AuditLog.findAll({
    where: dateFilter,
    attributes: [
      "admin_id",
      [fn("COUNT", col("AuditLog.id")), "actionCount"]
    ],
    include: [
      {
        model: User,
        as: "Admin",
        attributes: ["first_name", "last_name", "email"]
      }
    ],
    group: ["admin_id", "Admin.id"],
    order: [[literal("actionCount"), "DESC"]],
    limit: 10,
    raw: false
  });

  
  const errorTrends = await ErrorLog.findAll({
    where: dateFilter,
    attributes: [
      [fn("DATE", col("ErrorLog.created_at")), "date"],
      [fn("COUNT", col("ErrorLog.id")), "count"]
    ],
    group: [fn("DATE", col("ErrorLog.created_at"))],
    order: [[fn("DATE", col("ErrorLog.created_at")), "ASC"]],
    raw: true
  });

  return {
    auditLogs: {
      byActionType: auditStats.map(stat => ({
        actionType: stat.action_type,
        count: parseInt(stat.count)
      })),
      total: auditStats.reduce((sum, stat) => sum + parseInt(stat.count), 0)
    },
    paymentLogs: {
      byStatus: paymentStats.map(stat => ({
        status: stat.payment_status,
        count: parseInt(stat.count),
        totalAmount: parseFloat(stat.totalAmount || 0)
      })),
      total: paymentStats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
      totalRevenue: paymentStats.reduce((sum, stat) => sum + parseFloat(stat.totalAmount || 0), 0)
    },
    enrollmentLogs: {
      byStatus: enrollmentStats.map(stat => ({
        status: stat.action,
        count: parseInt(stat.count)
      })),
      total: enrollmentStats.reduce((sum, stat) => sum + parseInt(stat.count), 0)
    },
    errorLogs: {
      bySeverity: errorStats.map(stat => ({
        severity: stat.severity,
        count: parseInt(stat.count)
      })),
      total: errorStats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
      trends: errorTrends.map(trend => ({
        date: trend.date,
        count: parseInt(trend.count)
      }))
    },
    mostActiveAdmins: activeAdmins.map(admin => ({
      adminId: admin.admin_id,
      name: admin.Admin ? `${admin.Admin.first_name} ${admin.Admin.last_name}` : "Unknown",
      email: admin.Admin?.email,
      actionCount: parseInt(admin.dataValues.actionCount)
    })),
    period: {
      startDate: startDate || null,
      endDate: endDate || null
    }
  };
};


export const searchAllLogs = async (searchTerm, options = {}) => {
  const { limit = 10, startDate, endDate } = options;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.created_at = {};
    if (startDate) dateFilter.created_at[Op.gte] = new Date(startDate);
    if (endDate) dateFilter.created_at[Op.lte] = new Date(endDate);
  }

  
  const auditResults = await getAuditLogs({
    search: searchTerm,
    startDate,
    endDate,
    limit
  });

  
  const paymentResults = await getPaymentLogs({
    search: searchTerm,
    startDate,
    endDate,
    limit
  });

  
  const enrollmentResults = await getEnrollmentLogs({
    search: searchTerm,
    startDate,
    endDate,
    limit
  });

  
  const errorResults = await getErrorLogs({
    search: searchTerm,
    startDate,
    endDate,
    limit
  });

  return {
    searchTerm,
    results: {
      audit: {
        count: auditResults.pagination.total,
        logs: auditResults.logs
      },
      payment: {
        count: paymentResults.pagination.total,
        logs: paymentResults.logs
      },
      enrollment: {
        count: enrollmentResults.pagination.total,
        logs: enrollmentResults.logs
      },
      error: {
        count: errorResults.pagination.total,
        logs: errorResults.logs
      }
    },
    totalResults: 
      auditResults.pagination.total +
      paymentResults.pagination.total +
      enrollmentResults.pagination.total +
      errorResults.pagination.total
  };
};
