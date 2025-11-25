/**
 * Notification Service
 * Purpose: Handle notification-related business logic
 * Includes: CRUD operations for notifications, broadcast messaging, scheduling, and engagement tracking
 */

import models from "../../models/index.js";
import { Op, fn, col } from "sequelize";

const { Notification, User, NotificationLog } = models;

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @returns {Array} List of notifications
 */
export const getNotificationsByUser = async (userId) => {
  const notifications = await Notification.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
  });

  return notifications;
};

/**
 * Get user notifications with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} Notifications with pagination info
 */
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

  return {
    notifications: rows,
    total: count,
    limit,
    offset
  };
};

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Object} Notification object
 */
export const getNotificationById = async (notificationId) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @returns {Object} Created notification
 */
export const createNotification = async (notificationData) => {
  const { user_id, message, type, title, related_id, related_type } = notificationData;

  // Verify user exists
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

/**
 * Update notification (mark as read)
 * @param {string} notificationId - Notification ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID making the request
 * @returns {Object} Updated notification
 */
export const updateNotification = async (notificationId, updateData, userId) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if user owns the notification
  if (notification.user_id !== userId) {
    const error = new Error("Not authorized to update this notification");
    error.statusCode = 403;
    throw error;
  }

  await notification.update(updateData);

  return notification;
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID making the request
 * @returns {Object} Success message
 */
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if user owns the notification
  if (notification.user_id !== userId) {
    const error = new Error("Not authorized to delete this notification");
    error.statusCode = 403;
    throw error;
  }

  await notification.destroy();

  return { message: "Notification deleted successfully" };
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
export const markAllAsRead = async (userId) => {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );

  return { message: "All notifications marked as read" };
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {number} Count of unread notifications
 */
export const getUnreadCount = async (userId) => {
  const count = await Notification.count({
    where: { user_id: userId, is_read: false },
  });

  return count;
};

/**
 * Broadcast notification to target audience with enhanced features
 * @param {Object} notificationData - Notification data with target audience
 * @param {string} adminId - Admin ID creating the notification
 * @returns {Object} Result with delivery stats
 */
export const broadcastNotification = async (notificationData, adminId) => {
  const { title, message, targetAudience, scheduledAt, type = "announcement" } = notificationData;

  // Validate target audience
  const validAudiences = ["all", "students", "instructors"];
  if (!validAudiences.includes(targetAudience)) {
    const error = new Error("Invalid target audience. Must be 'all', 'students', or 'instructors'");
    error.statusCode = 400;
    throw error;
  }

  // Get recipients based on target audience
  const recipients = await getRecipientsByAudience(targetAudience);

  if (recipients.length === 0) {
    const error = new Error("No recipients found for target audience");
    error.statusCode = 400;
    throw error;
  }

  // If scheduled for future, store for later delivery
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

  // Create notifications for all recipients
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

  // Log the broadcast to NotificationLog
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

/**
 * Get recipients by target audience with filtering
 * @param {string} targetAudience - "all", "students", or "instructors"
 * @param {Object} additionalFilters - Optional additional filters
 * @returns {Array} List of users
 */
async function getRecipientsByAudience(targetAudience, additionalFilters = {}) {
  const whereClause = { is_active: true, ...additionalFilters };

  if (targetAudience === "students") {
    whereClause.role = "student";
  } else if (targetAudience === "instructors") {
    whereClause.role = "instructor";
  }
  // "all" means no role filter

  const users = await User.findAll({
    where: whereClause,
    attributes: ["id", "email", "first_name", "last_name", "role"]
  });

  return users;
}

/**
 * Schedule notification for future delivery
 * @param {Object} scheduleData - Notification scheduling data
 * @returns {Object} Scheduled notification details
 */
async function scheduleNotification(scheduleData) {
  const { title, message, targetAudience, scheduledAt, type, adminId, recipientCount } = scheduleData;

  // Create notification log entry with scheduled status
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

/**
 * Get notification history with enhanced filtering and engagement metrics
 * @param {Object} filters - Filter options (startDate, endDate, status, targetAudience)
 * @returns {Array} List of broadcast notifications with engagement data
 */
export const getNotificationHistory = async (filters = {}) => {
  const whereClause = {};

  // Filter by date range
  if (filters.startDate || filters.endDate) {
    whereClause.sent_at = {};
    if (filters.startDate) {
      whereClause.sent_at[Op.gte] = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.sent_at[Op.lte] = new Date(filters.endDate);
    }
  }

  // Filter by status
  if (filters.status) {
    whereClause.status = filters.status;
  }

  // Filter by target audience
  if (filters.targetAudience) {
    whereClause.target_audience = filters.targetAudience;
  }

  // Get notification logs with sender information
  const notificationLogs = await NotificationLog.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "Sender",
        attributes: ["id", "first_name", "last_name", "email"]
      },
      {
        model: Notification,
        attributes: ["id", "title", "message"]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: filters.limit || 100,
    offset: filters.offset || 0
  });

  // Calculate engagement metrics for each notification
  const historyWithMetrics = await Promise.all(
    notificationLogs.map(async (log) => {
      const openedCount = log.opened_count || 0;

      const openRate = log.delivered_count > 0 
        ? ((openedCount / log.delivered_count) * 100).toFixed(1)
        : 0;

      return {
        id: log.id,
        title: log.Notification?.title || "N/A",
        message: log.Notification?.message || "N/A",
        targetAudience: log.target_audience,
        recipientCount: log.recipient_count,
        deliveredCount: log.delivered_count,
        failedCount: log.failed_count,
        openedCount,
        openRate: parseFloat(openRate),
        status: log.status,
        sentAt: log.sent_at,
        createdAt: log.created_at,
        admin: log.Sender ? {
          id: log.Sender.id,
          name: `${log.Sender.first_name} ${log.Sender.last_name}`,
          email: log.Sender.email
        } : null
      };
    })
  );

  return historyWithMetrics;
};

/**
 * Get detailed engagement metrics for a specific notification
 * @param {string} notificationLogId - NotificationLog ID
 * @returns {Object} Detailed engagement metrics
 */
export const getNotificationMetrics = async (notificationLogId) => {
  const notificationLog = await NotificationLog.findByPk(notificationLogId);

  if (!notificationLog) {
    const error = new Error("Notification log not found");
    error.statusCode = 404;
    throw error;
  }

  // Get all individual notifications sent for this broadcast
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

  // Calculate engagement by audience segment
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

/**
 * Get scheduled notifications that are ready to send
 * @returns {Array} List of notifications ready for delivery
 */
export const getScheduledNotificationsToSend = async () => {
  const now = new Date();

  const scheduledNotifications = await NotificationLog.findAll({
    where: {
      status: "scheduled"
    },
    include: [
      {
        model: User,
        as: "Sender",
        attributes: ["id", "first_name", "last_name"]
      },
      {
        model: Notification,
        attributes: ["id", "title", "message"]
      }
    ]
  });

  return scheduledNotifications;
};

/**
 * Process and send a scheduled notification
 * @param {string} notificationLogId - NotificationLog ID
 * @returns {Object} Delivery result
 */
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

  // Get recipients based on target audience
  const recipients = await getRecipientsByAudience(notificationLog.target_audience);

  if (recipients.length === 0) {
    // Update status to failed
    await notificationLog.update({
      status: "failed",
      failed_count: notificationLog.recipient_count
    });

    return {
      success: false,
      message: "No recipients found"
    };
  }

  // Create notifications for all recipients
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

  // Update notification log
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

/**
 * Cancel a scheduled notification
 * @param {string} notificationLogId - NotificationLog ID
 * @param {string} adminId - Admin ID canceling the notification
 * @returns {Object} Cancellation result
 */
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

/**
 * Get notification delivery statistics
 * @param {Object} filters - Filter options (startDate, endDate, targetAudience)
 * @returns {Object} Delivery statistics
 */
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

  whereClause.status = "sent";

  const stats = await NotificationLog.findAll({
    where: whereClause,
    attributes: [
      [fn("COUNT", col("id")), "totalBroadcasts"],
      [fn("SUM", col("recipient_count")), "totalRecipients"],
      [fn("SUM", col("delivered_count")), "totalDelivered"],
      [fn("SUM", col("failed_count")), "totalFailed"]
    ],
    raw: true
  });

  const result = stats[0] || {};
  const totalBroadcasts = parseInt(result.totalBroadcasts || 0);
  const totalRecipients = parseInt(result.totalRecipients || 0);
  const totalDelivered = parseInt(result.totalDelivered || 0);
  const totalFailed = parseInt(result.totalFailed || 0);

  const deliveryRate = totalRecipients > 0 
    ? ((totalDelivered / totalRecipients) * 100).toFixed(1)
    : 0;

  return {
    totalBroadcasts,
    totalRecipients,
    totalDelivered,
    totalFailed,
    deliveryRate: parseFloat(deliveryRate),
    period: {
      startDate: filters.startDate || null,
      endDate: filters.endDate || null
    }
  };
};
