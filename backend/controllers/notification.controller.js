/**
 * Notification Controller
 * Purpose: Handle notification route handlers
 * Routes: /api/notifications
 */

import * as notificationService from "../services/notification.service.js";

/**
 * Get all notifications for current user
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsByUser(req.user.id);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new notification
 * POST /api/notifications
 */
export const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    
    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification (mark as read)
 * PUT /api/notifications/:id
 */
export const updateNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.updateNotification(
      req.params.id,
      req.body,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/mark-all-read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    
    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};
