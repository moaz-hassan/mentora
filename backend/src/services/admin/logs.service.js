import {
  AuditLog,
  PaymentLog,
  EnrollmentLog,
  ErrorLog,
  User,
  Course
} from "../../models/index.js";

/**
 * Create an audit log entry
 */
export const logAudit = async ({
  adminId,
  actionType,
  resourceType,
  resourceId,
  description,
  ipAddress,
  userAgent,
  status,
  metadata = {}
}) => {
  try {
    await AuditLog.create({
      admin_id: adminId,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      description,
      ip_address: ipAddress,
      user_agent: userAgent,
      status,
      before_state: metadata.beforeState || null,
      after_state: metadata.afterState || metadata
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

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

  const query = {};

  if (adminId) query.admin_id = adminId;
  if (actionType) query.action_type = actionType;
  if (resourceType) query.resource_type = resourceType;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { action_type: searchRegex },
      { resource_type: searchRegex },
      { resource_id: searchRegex },
      { description: searchRegex }
    ];
  }

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const skip = (parsedPage - 1) * parsedLimit;

  const [count, rows] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean()
  ]);

  const logs = await Promise.all(
    rows.map(async (log) => {
      let admin = null;
      if (log.admin_id) {
        const u = await User.findById(log.admin_id).select("first_name last_name email").lean();
        if (u) {
          admin = {
            id: u._id.toString(),
            name: `${u.first_name} ${u.last_name}`,
            email: u.email
          };
        }
      }

      return {
        id: log._id.toString(),
        admin,
        actionType: log.action_type,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        description: log.description,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        status: log.status,
        metadata: log.after_state || log.metadata,
        createdAt: log.createdAt || log.created_at
      };
    })
  );

  return {
    logs,
    pagination: {
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit)
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

  const query = {};

  if (userId) query.student_id = userId;
  if (courseId) query.course_id = courseId;
  if (status) query.payment_status = status;
  if (paymentMethod) query.payment_method = paymentMethod;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = parseFloat(minAmount);
    if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { transaction_id: searchRegex },
      { payment_status: searchRegex },
      { payment_method: searchRegex }
    ];
  }

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const skip = (parsedPage - 1) * parsedLimit;

  const [count, rows] = await Promise.all([
    PaymentLog.countDocuments(query),
    PaymentLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean()
  ]);

  const logs = await Promise.all(
    rows.map(async (log) => {
      let student = null;
      let course = null;

      if (log.student_id) {
        const u = await User.findById(log.student_id).select("first_name last_name email").lean();
        if (u) {
          student = {
            id: u._id.toString(),
            name: `${u.first_name} ${u.last_name}`,
            email: u.email
          };
        }
      }

      if (log.course_id) {
        const c = await Course.findById(log.course_id).select("title price").lean();
        if (c) {
          course = {
            id: c._id.toString(),
            title: c.title,
            price: c.price
          };
        }
      }

      return {
        id: log._id.toString(),
        transactionId: log.transaction_id,
        user: student,
        course,
        amount: log.amount,
        currency: log.currency,
        paymentMethod: log.payment_method,
        status: log.payment_status,
        metadata: log.gateway_response,
        createdAt: log.createdAt || log.created_at
      };
    })
  );

  return {
    logs,
    pagination: {
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit)
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

  const query = {};

  if (userId) query.student_id = userId;
  if (courseId) query.course_id = courseId;
  if (status) query.action = status;
  if (source) query.enrollment_source = source;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { enrollment_id: searchRegex },
      { action: searchRegex },
      { enrollment_source: searchRegex }
    ];
  }

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const skip = (parsedPage - 1) * parsedLimit;

  const [count, rows] = await Promise.all([
    EnrollmentLog.countDocuments(query),
    EnrollmentLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean()
  ]);

  const logs = await Promise.all(
    rows.map(async (log) => {
      let student = null;
      let course = null;

      if (log.student_id) {
        const u = await User.findById(log.student_id).select("first_name last_name email").lean();
        if (u) {
          student = {
            id: u._id.toString(),
            name: `${u.first_name} ${u.last_name}`,
            email: u.email
          };
        }
      }

      if (log.course_id) {
        const c = await Course.findById(log.course_id).select("title").lean();
        if (c) {
          course = {
            id: c._id.toString(),
            title: c.title
          };
        }
      }

      return {
        id: log._id.toString(),
        enrollmentId: log.enrollment_id,
        user: student,
        course,
        status: log.action,
        source: log.enrollment_source,
        paymentStatus: log.payment_status,
        metadata: log.metadata,
        createdAt: log.createdAt || log.created_at
      };
    })
  );

  return {
    logs,
    pagination: {
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit)
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

  const query = {};

  if (severity) query.severity = severity;
  if (errorType) query.error_type = errorType;
  if (userId) query.user_id = userId;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { error_type: searchRegex },
      { error_message: searchRegex },
      { endpoint: searchRegex }
    ];
  }

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const skip = (parsedPage - 1) * parsedLimit;

  const [count, rows] = await Promise.all([
    ErrorLog.countDocuments(query),
    ErrorLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean()
  ]);

  const logs = await Promise.all(
    rows.map(async (log) => {
      let user = null;
      if (log.user_id) {
        const u = await User.findById(log.user_id).select("first_name last_name email").lean();
        if (u) {
          user = {
            id: u._id.toString(),
            name: `${u.first_name} ${u.last_name}`,
            email: u.email
          };
        }
      }

      return {
        id: log._id.toString(),
        errorType: log.error_type,
        errorMessage: log.error_message,
        stackTrace: log.stack_trace,
        severity: log.severity,
        endpoint: log.endpoint,
        method: log.method,
        user,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        metadata: log.metadata,
        createdAt: log.createdAt || log.created_at
      };
    })
  );

  return {
    logs,
    pagination: {
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit)
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
          `"${(log.description || "").replace(/"/g, '""')}"`,
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
          `"${(log.errorMessage || "").replace(/"/g, '""')}"`,
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

  const matchFilter = {};
  if (startDate || endDate) {
    matchFilter.createdAt = {};
    if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
    if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
  }

  const [auditStats, paymentStats, enrollmentStats, errorStats, activeAdminsRaw, errorTrends] = await Promise.all([
    AuditLog.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$action_type", count: { $sum: 1 } } }
    ]),
    PaymentLog.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$payment_status", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
    ]),
    EnrollmentLog.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$action", count: { $sum: 1 } } }
    ]),
    ErrorLog.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]),
    AuditLog.aggregate([
      { $match: { ...matchFilter, admin_id: { $ne: null } } },
      { $group: { _id: "$admin_id", actionCount: { $sum: 1 } } },
      { $sort: { actionCount: -1 } },
      { $limit: 10 }
    ]),
    ErrorLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const mostActiveAdmins = await Promise.all(
    activeAdminsRaw.map(async (item) => {
      const admin = await User.findById(item._id).select("first_name last_name email").lean();
      return {
        adminId: item._id,
        name: admin ? `${admin.first_name} ${admin.last_name}` : "Unknown",
        email: admin?.email,
        actionCount: item.actionCount
      };
    })
  );

  return {
    auditLogs: {
      byActionType: auditStats.map(stat => ({
        actionType: stat._id,
        count: stat.count
      })),
      total: auditStats.reduce((sum, stat) => sum + stat.count, 0)
    },
    paymentLogs: {
      byStatus: paymentStats.map(stat => ({
        status: stat._id,
        count: stat.count,
        totalAmount: parseFloat(stat.totalAmount || 0)
      })),
      total: paymentStats.reduce((sum, stat) => sum + stat.count, 0),
      totalRevenue: paymentStats.reduce((sum, stat) => sum + parseFloat(stat.totalAmount || 0), 0)
    },
    enrollmentLogs: {
      byStatus: enrollmentStats.map(stat => ({
        status: stat._id,
        count: stat.count
      })),
      total: enrollmentStats.reduce((sum, stat) => sum + stat.count, 0)
    },
    errorLogs: {
      bySeverity: errorStats.map(stat => ({
        severity: stat._id,
        count: stat.count
      })),
      total: errorStats.reduce((sum, stat) => sum + stat.count, 0),
      trends: errorTrends.map(trend => ({
        date: trend._id,
        count: trend.count
      }))
    },
    mostActiveAdmins,
    period: {
      startDate: startDate || null,
      endDate: endDate || null
    }
  };
};

export const searchAllLogs = async (searchTerm, options = {}) => {
  const { limit = 10, startDate, endDate } = options;

  const [auditResults, paymentResults, enrollmentResults, errorResults] = await Promise.all([
    getAuditLogs({ search: searchTerm, startDate, endDate, limit }),
    getPaymentLogs({ search: searchTerm, startDate, endDate, limit }),
    getEnrollmentLogs({ search: searchTerm, startDate, endDate, limit }),
    getErrorLogs({ search: searchTerm, startDate, endDate, limit })
  ]);

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
