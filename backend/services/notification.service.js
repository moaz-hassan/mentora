/**
 * Notification Service
 * Purpose: Handle notification-related business logic
 * Includes: CRUD operations for notifications
 */

import models from "../models/index.model.js";

const { Notification, User } = models;

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
