import notificationRepository from "../../repositories/communication/notification.repository.js";
import userRepository from "../../repositories/auth/user.repository.js";
import Notification from "../../models/communication/notification.model.js";
import NotificationLog from "../../models/communication/notificationLog.model.js";
import User from "../../models/auth/user.model.js";

export const getNotificationsByUser = async (userId) => {
  return await notificationRepository.findByUserId(userId);
};

export const getUserNotifications = async (userId, options = {}) => {
  const { limit = 50, offset = 0, unreadOnly = false } = options;

  const filter = { user_id: userId };
  if (unreadOnly) filter.is_read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).exec(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user_id: userId, is_read: false }),
  ]);

  return { notifications, total, unreadCount, limit, offset };
};

export const getNotificationById = async (notificationId) => {
  const notification = await notificationRepository.findById(notificationId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

export const createNotification = async (notificationData) => {
  const { user_id, message, type, title, related_id, related_type } = notificationData;

  // Verify user exists (soft check - don't throw if missing, caller handles it)
  const user = await User.findById(user_id).select("_id").exec();
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return await notificationRepository.create({
    user_id,
    message,
    type: type || "info",
    title: title || null,
    related_id: related_id || null,
    related_type: related_type || null,
    is_read: false,
  });
};

export const updateNotification = async (notificationId, updateData, userId) => {
  const notification = await notificationRepository.findById(notificationId);

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

  return await Notification.findByIdAndUpdate(notificationId, { $set: updateData }, { new: true }).exec();
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await notificationRepository.findById(notificationId);

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

  await notificationRepository.deleteById(notificationId);

  return { message: "Notification deleted successfully" };
};

export const markAllAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
  return { message: "All notifications marked as read" };
};

export const getUnreadCount = async (userId) => {
  return await notificationRepository.countUnread(userId);
};

// ─── Broadcast Notifications ──────────────────────────────────────────────────

async function getRecipientsByAudience(targetAudience) {
  const filter = { is_active: true };
  if (targetAudience === "students") filter.role = "student";
  else if (targetAudience === "instructors") filter.role = "instructor";
  else if (targetAudience === "admins") filter.role = "admin";
  // 'all' => no role filter

  return await User.find(filter).select("id email first_name last_name role").exec();
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
    status: "scheduled",
  });

  return {
    id: scheduledNotification._id.toString(),
    title,
    message,
    targetAudience,
    recipientCount,
    scheduledAt: new Date(scheduledAt),
    status: "scheduled",
    message: "Notification scheduled successfully",
  };
}

export const broadcastNotification = async (notificationData, adminId) => {
  const { title, message, targetAudience, scheduledAt, type = "announcement" } = notificationData;

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
    return await scheduleNotification({ title, message, targetAudience, scheduledAt, type, adminId, recipientCount: recipients.length });
  }

  const results = await Promise.allSettled(
    recipients.map((user) =>
      Notification.create({
        user_id: user._id.toString(),
        title,
        message,
        type,
        is_read: false,
      })
    )
  );

  const delivered = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

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
      status: "sent",
    });
  } catch (logError) {
    console.error("Failed to log notification broadcast:", logError);
  }

  return { recipientCount: recipients.length, deliveredCount: delivered, failedCount: failed, targetAudience, sentAt: new Date(), status: "sent" };
};

export const getNotificationHistory = async (filters = {}) => {
  const filter = {};

  if (filters.startDate || filters.endDate) {
    filter.sent_at = {};
    if (filters.startDate) filter.sent_at.$gte = new Date(filters.startDate);
    if (filters.endDate) filter.sent_at.$lte = new Date(filters.endDate);
  }

  if (filters.status) filter.status = filters.status;
  if (filters.targetAudience) filter.target_audience = filters.targetAudience;

  const notificationLogs = await NotificationLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(filters.offset || 0)
    .limit(filters.limit || 100)
    .exec();

  const historyWithMetrics = notificationLogs.map((log) => {
    const openedCount = log.opened_count || 0;
    const openRate = log.delivered_count > 0 ? ((openedCount / log.delivered_count) * 100).toFixed(1) : 0;
    return {
      id: log._id.toString(),
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
      createdAt: log.createdAt,
      admin: null,
    };
  });

  return { notifications: historyWithMetrics };
};

export const getNotificationMetrics = async (notificationLogId) => {
  const notificationLog = await NotificationLog.findById(notificationLogId).exec();

  if (!notificationLog) {
    const error = new Error("Notification log not found");
    error.statusCode = 404;
    throw error;
  }

  const sentRef = notificationLog.sent_at || notificationLog.createdAt;
  const notifications = await Notification.find({
    title: notificationLog.title,
    message: notificationLog.message,
    createdAt: {
      $gte: sentRef,
      $lte: new Date(new Date(sentRef).getTime() + 60000),
    },
  }).exec();

  const total = notifications.length;
  const opened = notifications.filter((n) => n.is_read).length;
  const unopened = total - opened;
  const openRate = total > 0 ? ((opened / total) * 100).toFixed(1) : 0;

  return {
    id: notificationLog._id.toString(),
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
  };
};

export const getScheduledNotificationsToSend = async () => {
  const scheduledNotifications = await NotificationLog.find({ status: "scheduled" })
    .sort({ scheduled_at: 1 })
    .exec();

  const notifications = scheduledNotifications.map((log) => ({
    id: log._id.toString(),
    title: log.title || "N/A",
    message: log.message || "N/A",
    targetAudience: log.target_audience,
    scheduledFor: log.scheduled_at,
    recipientCount: log.recipient_count,
    admin: null,
  }));

  return { notifications };
};

export const sendScheduledNotification = async (notificationLogId) => {
  const notificationLog = await NotificationLog.findById(notificationLogId).exec();

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
    await NotificationLog.findByIdAndUpdate(notificationLogId, {
      $set: { status: "failed", failed_count: notificationLog.recipient_count },
    });
    return { success: false, message: "No recipients found" };
  }

  const results = await Promise.allSettled(
    recipients.map((user) =>
      Notification.create({
        user_id: user._id.toString(),
        title: notificationLog.title || "Notification",
        message: notificationLog.message || "",
        type: "announcement",
        is_read: false,
      })
    )
  );

  const delivered = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  await NotificationLog.findByIdAndUpdate(notificationLogId, {
    $set: { status: "sent", sent_at: new Date(), delivered_count: delivered, failed_count: failed, recipient_count: recipients.length },
  });

  return { success: true, recipientCount: recipients.length, deliveredCount: delivered, failedCount: failed, sentAt: new Date() };
};

export const cancelScheduledNotification = async (notificationLogId) => {
  const notificationLog = await NotificationLog.findById(notificationLogId).exec();

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

  await NotificationLog.findByIdAndUpdate(notificationLogId, { $set: { status: "canceled" } });

  return { success: true, message: "Scheduled notification canceled successfully" };
};

export const getDeliveryStatistics = async (filters = {}) => {
  const matchStage = { status: "sent" };
  if (filters.startDate || filters.endDate) {
    matchStage.sent_at = {};
    if (filters.startDate) matchStage.sent_at.$gte = new Date(filters.startDate);
    if (filters.endDate) matchStage.sent_at.$lte = new Date(filters.endDate);
  }
  if (filters.targetAudience) matchStage.target_audience = filters.targetAudience;

  const [sentStats, scheduledCount] = await Promise.all([
    NotificationLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalRecipients: { $sum: "$recipient_count" },
          totalDelivered: { $sum: "$delivered_count" },
          totalFailed: { $sum: "$failed_count" },
        },
      },
    ]),
    NotificationLog.countDocuments({ status: "scheduled" }),
  ]);

  const result = sentStats[0] || {};
  const totalSent = result.totalSent || 0;
  const totalRecipients = result.totalRecipients || 0;
  const totalDelivered = result.totalDelivered || 0;
  const totalFailed = result.totalFailed || 0;
  const deliveryRate = totalRecipients > 0 ? ((totalDelivered / totalRecipients) * 100).toFixed(1) : 0;

  return { totalSent, delivered: totalDelivered, scheduled: scheduledCount, totalRecipients, deliveryRate: parseFloat(deliveryRate), totalFailed };
};

export default {
  getNotificationsByUser,
  getUserNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAllAsRead,
  getUnreadCount,
  broadcastNotification,
  getNotificationHistory,
  getNotificationMetrics,
  getScheduledNotificationsToSend,
  sendScheduledNotification,
  cancelScheduledNotification,
  getDeliveryStatistics,
};
