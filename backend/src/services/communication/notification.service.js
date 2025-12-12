

import models from "../../models/index.js";
import { Op, fn, col } from "sequelize";

const { Notification, User, NotificationLog } = models;


export const getNotificationsByUser = async (userId) => {
  const notifications = await Notification.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
  });

  return notifications;
};


export const getUserNotifications = async (userId, options = {}) => {
  const { limit = 50, offset = 0, unreadOnly = false } = options;
  
  const whereClause = { user_id: userId };
  if (unreadOnly) {
    whereClause.is_read = false;
  }

  const { count, rows } = await Notification.findAndCountAll({
    where: whereClause,
    order: [["created_at", "DESC"]],
    limit,
    offset
  });

  // Get unread count
  const unreadCount = await Notification.count({
    where: { user_id: userId, is_read: false }
  });

  return {
    notifications: rows,
    total: count,
    unreadCount,
    limit,
    offset
  };
};


export const getNotificationById = async (notificationId) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};


export const createNotification = async (notificationData) => {
  const { user_id, message, type, title, related_id, related_type } = notificationData;

  
  const user = await User.findByPk(user_id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const notification = await Notification.create({
    user_id,
    message,
    type: type || "info",
    title: title || null,
    related_id: related_id || null,
    related_type: related_type || null,
  });

  return notification;
};


export const updateNotification = async (notificationId, updateData, userId) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  
  if (notification.user_id !== userId) {
    const error = new Error("Not authorized to update this notification");
    error.statusCode = 403;
    throw error;
  }

  await notification.update(updateData);

  return notification;
};


export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  
  if (notification.user_id !== userId) {
    const error = new Error("Not authorized to delete this notification");
    error.statusCode = 403;
    throw error;
  }

  await notification.destroy();

  return { message: "Notification deleted successfully" };
};


export const markAllAsRead = async (userId) => {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );

  return { message: "All notifications marked as read" };
};


export const getUnreadCount = async (userId) => {
  const count = await Notification.count({
    where: { user_id: userId, is_read: false },
  });

  return count;
};


export const broadcastNotification = async (notificationData, adminId) => {
  const { title, message, targetAudience, scheduledAt, type = "announcement" } = notificationData;

  // Validate target audience - now includes 'admins'
  const validAudiences = ["all", "students", "instructors", "admins"];
  if (!validAudiences.includes(targetAudience)) {
    const error = new Error("Invalid target audience. Must be 'all', 'students', 'instructors', or 'admins'");
    error.statusCode = 400;
    throw error;
  }

  
  const recipients = await getRecipientsByAudience(targetAudience);

  if (recipients.length === 0) {
    const error = new Error("No recipients found for target audience");
    error.statusCode = 400;
    throw error;
  }

  
  if (scheduledAt && new Date(scheduledAt) > new Date()) {
    return await scheduleNotification({
      title,
      message,
      targetAudience,
      scheduledAt,
      type,
      adminId,
      recipientCount: recipients.length
    });
  }

  
  const notifications = await Promise.allSettled(
    recipients.map(user => 
      Notification.create({
        user_id: user.id,
        title,
        message,
        type,
        is_read: false
      })
    )
  );

  const delivered = notifications.filter(r => r.status === "fulfilled").length;
  const failed = notifications.filter(r => r.status === "rejected").length;

  
  try {
    await NotificationLog.create({
      admin_id: adminId,
      title,
      message,
      target_audience: targetAudience,
      recipient_count: recipients.length,
      delivered_count: delivered,
      failed_count: failed,
      scheduled_at: null,
      sent_at: new Date(),
      status: "sent"
    });
  } catch (logError) {
    console.error("Failed to log notification broadcast:", logError);
  }

  return {
    recipientCount: recipients.length,
    deliveredCount: delivered,
    failedCount: failed,
    targetAudience,
    sentAt: new Date(),
    status: "sent"
  };
};


async function getRecipientsByAudience(targetAudience, additionalFilters = {}) {
  const whereClause = { is_active: true, ...additionalFilters };

  if (targetAudience === "students") {
    whereClause.role = "student";
  } else if (targetAudience === "instructors") {
    whereClause.role = "instructor";
  } else if (targetAudience === "admins") {
    whereClause.role = "admin";
  }
  // 'all' means all roles - no role filter

  const users = await User.findAll({
    where: whereClause,
    attributes: ["id", "email", "first_name", "last_name", "role"]
  });

  return users;
}


async function scheduleNotification(scheduleData) {
  const { title, message, targetAudience, scheduledAt, type, adminId, recipientCount } = scheduleData;

  
  const scheduledNotification = await NotificationLog.create({
    admin_id: adminId,
    title,
    message,
    target_audience: targetAudience,
    recipient_count: recipientCount,
    delivered_count: 0,
    failed_count: 0,
    scheduled_at: new Date(scheduledAt),
    sent_at: null,
    status: "scheduled"
  });

  return {
    id: scheduledNotification.id,
    title,
    message,
    targetAudience,
    recipientCount,
    scheduledAt: new Date(scheduledAt),
    status: "scheduled",
    message: "Notification scheduled successfully"
  };
}


export const getNotificationHistory = async (filters = {}) => {
  const whereClause = {};

  
  if (filters.startDate || filters.endDate) {
    whereClause.sent_at = {};
    if (filters.startDate) {
      whereClause.sent_at[Op.gte] = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.sent_at[Op.lte] = new Date(filters.endDate);
    }
  }

  
  if (filters.status) {
    whereClause.status = filters.status;
  }

  
  if (filters.targetAudience) {
    whereClause.target_audience = filters.targetAudience;
  }

  
  const notificationLogs = await NotificationLog.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "Admin",
        attributes: ["id", "first_name", "last_name", "email"]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: filters.limit || 100,
    offset: filters.offset || 0
  });

  
  const historyWithMetrics = notificationLogs.map((log) => {
    const openedCount = log.opened_count || 0;

    const openRate = log.delivered_count > 0 
      ? ((openedCount / log.delivered_count) * 100).toFixed(1)
      : 0;

    return {
      id: log.id,
      title: log.title || "N/A",
      message: log.message || "N/A",
      targetAudience: log.target_audience,
      recipientCount: log.recipient_count,
      deliveredCount: log.delivered_count,
      failedCount: log.failed_count,
      openedCount,
      openRate: parseFloat(openRate),
      deliveryStatus: log.status,
      status: log.status,
      scheduledFor: log.scheduled_at,
      sentAt: log.sent_at,
      createdAt: log.created_at,
      admin: log.Admin ? {
        id: log.Admin.id,
        name: `${log.Admin.first_name} ${log.Admin.last_name}`,
        email: log.Admin.email
      } : null
    };
  });

  return { notifications: historyWithMetrics };
};


export const getNotificationMetrics = async (notificationLogId) => {
  const notificationLog = await NotificationLog.findByPk(notificationLogId);

  if (!notificationLog) {
    const error = new Error("Notification log not found");
    error.statusCode = 404;
    throw error;
  }

  
  const notifications = await Notification.findAll({
    where: {
      title: notificationLog.title,
      message: notificationLog.message,
      created_at: {
        [Op.gte]: notificationLog.sent_at || notificationLog.created_at,
        [Op.lte]: new Date(new Date(notificationLog.sent_at || notificationLog.created_at).getTime() + 60000)
      }
    },
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email", "role"]
      }
    ]
  });

  const total = notifications.length;
  const opened = notifications.filter(n => n.is_read).length;
  const unopened = total - opened;
  const openRate = total > 0 ? ((opened / total) * 100).toFixed(1) : 0;

  
  const byRole = notifications.reduce((acc, n) => {
    const role = n.User?.role || "unknown";
    if (!acc[role]) {
      acc[role] = { total: 0, opened: 0 };
    }
    acc[role].total++;
    if (n.is_read) acc[role].opened++;
    return acc;
  }, {});

  return {
    id: notificationLog.id,
    title: notificationLog.title,
    message: notificationLog.message,
    targetAudience: notificationLog.target_audience,
    status: notificationLog.status,
    totalSent: total,
    delivered: notificationLog.delivered_count,
    failed: notificationLog.failed_count,
    opened,
    unopened,
    openRate: parseFloat(openRate),
    sentAt: notificationLog.sent_at,
    scheduledAt: notificationLog.scheduled_at,
    engagementByRole: Object.entries(byRole).map(([role, stats]) => ({
      role,
      total: stats.total,
      opened: stats.opened,
      openRate: stats.total > 0 ? ((stats.opened / stats.total) * 100).toFixed(1) : 0
    }))
  };
};


export const getScheduledNotificationsToSend = async () => {
  const scheduledNotifications = await NotificationLog.findAll({
    where: {
      status: "scheduled"
    },
    include: [
      {
        model: User,
        as: "Admin",
        attributes: ["id", "first_name", "last_name"]
      }
    ],
    order: [["scheduled_at", "ASC"]]
  });

  const notifications = scheduledNotifications.map(log => ({
    id: log.id,
    title: log.title || "N/A",
    message: log.message || "N/A",
    targetAudience: log.target_audience,
    scheduledFor: log.scheduled_at,
    recipientCount: log.recipient_count,
    admin: log.Admin ? {
      id: log.Admin.id,
      name: `${log.Admin.first_name} ${log.Admin.last_name}`
    } : null
  }));

  return { notifications };
};


export const sendScheduledNotification = async (notificationLogId) => {
  const notificationLog = await NotificationLog.findByPk(notificationLogId, {
    include: [
      {
        model: Notification,
        attributes: ["id", "title", "message"]
      }
    ]
  });

  if (!notificationLog) {
    const error = new Error("Scheduled notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (notificationLog.status !== "scheduled") {
    const error = new Error("Notification is not in scheduled status");
    error.statusCode = 400;
    throw error;
  }

  
  const recipients = await getRecipientsByAudience(notificationLog.target_audience);

  if (recipients.length === 0) {
    
    await notificationLog.update({
      status: "failed",
      failed_count: notificationLog.recipient_count
    });

    return {
      success: false,
      message: "No recipients found"
    };
  }

  
  const notifications = await Promise.allSettled(
    recipients.map(user => 
      Notification.create({
        user_id: user.id,
        title: notificationLog.Notification?.title || "Notification",
        message: notificationLog.Notification?.message || "",
        type: "announcement",
        is_read: false
      })
    )
  );

  const delivered = notifications.filter(r => r.status === "fulfilled").length;
  const failed = notifications.filter(r => r.status === "rejected").length;

  
  await notificationLog.update({
    status: "sent",
    sent_at: new Date(),
    delivered_count: delivered,
    failed_count: failed,
    recipient_count: recipients.length
  });

  return {
    success: true,
    recipientCount: recipients.length,
    deliveredCount: delivered,
    failedCount: failed,
    sentAt: new Date()
  };
};


export const cancelScheduledNotification = async (notificationLogId, adminId) => {
  const notificationLog = await NotificationLog.findByPk(notificationLogId);

  if (!notificationLog) {
    const error = new Error("Scheduled notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (notificationLog.status !== "scheduled") {
    const error = new Error("Only scheduled notifications can be canceled");
    error.statusCode = 400;
    throw error;
  }

  await notificationLog.update({
    status: "canceled"
  });

  return {
    success: true,
    message: "Scheduled notification canceled successfully"
  };
};


export const getDeliveryStatistics = async (filters = {}) => {
  const whereClause = {};

  if (filters.startDate || filters.endDate) {
    whereClause.sent_at = {};
    if (filters.startDate) {
      whereClause.sent_at[Op.gte] = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.sent_at[Op.lte] = new Date(filters.endDate);
    }
  }

  if (filters.targetAudience) {
    whereClause.target_audience = filters.targetAudience;
  }

  // Get sent statistics
  const sentStats = await NotificationLog.findAll({
    where: { ...whereClause, status: "sent" },
    attributes: [
      [fn("COUNT", col("id")), "totalSent"],
      [fn("SUM", col("recipient_count")), "totalRecipients"],
      [fn("SUM", col("delivered_count")), "totalDelivered"],
      [fn("SUM", col("failed_count")), "totalFailed"]
    ],
    raw: true
  });

  // Get scheduled count
  const scheduledCount = await NotificationLog.count({
    where: { status: "scheduled" }
  });

  const result = sentStats[0] || {};
  const totalSent = parseInt(result.totalSent || 0);
  const totalRecipients = parseInt(result.totalRecipients || 0);
  const totalDelivered = parseInt(result.totalDelivered || 0);
  const totalFailed = parseInt(result.totalFailed || 0);

  const deliveryRate = totalRecipients > 0 
    ? ((totalDelivered / totalRecipients) * 100).toFixed(1)
    : 0;

  return {
    totalSent,
    delivered: totalDelivered,
    scheduled: scheduledCount,
    totalRecipients,
    deliveryRate: parseFloat(deliveryRate),
    totalFailed
  };
};
