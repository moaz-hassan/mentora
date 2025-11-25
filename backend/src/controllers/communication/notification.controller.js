/**
 * Notification Controller
 * Purpose: Handle HTTP requests for notification operations
 */

import * as notificationService from "../../services/communication/notification.service.js";

/**
 * Broadcast notification to target audience
 * POST /api/admin/notifications/broadcast
 */
export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetAudience, scheduledAt, type } = req.body;
    const adminId = req.user.id;

    const result = await notificationService.broadcastNotification(
      { title, message, targetAudience, scheduledAt, type },
      adminId
    );

    res.status(200).json({
      success: true,
      message: result.status === "scheduled" 
        ? "Notification scheduled successfully" 
        : "Notification sent successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification history
 * GET /api/admin/notifications/history
 */
export const getNotificationHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, status, targetAudience, limit, offset } = req.query;

    const history = await notificationService.getNotificationHistory({
      startDate,
      endDate,
      status,
      targetAudience,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification metrics
 * GET /api/admin/notifications/:id/metrics
 */
export const getNotificationMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const metrics = await notificationService.getNotificationMetrics(id);

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get scheduled notifications ready to send
 * GET /api/admin/notifications/scheduled
 */
export const getScheduledNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getScheduledNotificationsToSend();

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a scheduled notification
 * POST /api/admin/notifications/:id/send
 */
export const sendScheduledNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await notificationService.sendScheduledNotification(id);

    res.status(200).json({
      success: true,
      message: "Scheduled notification sent successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a scheduled notification
 * DELETE /api/admin/notifications/:id/cancel
 */
export const cancelScheduledNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const result = await notificationService.cancelScheduledNotification(id, adminId);

    res.status(200).json({
      success: true,
      message: "Scheduled notification canceled successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get delivery statistics
 * GET /api/admin/notifications/statistics
 */
export const getDeliveryStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate, targetAudience } = req.query;

    const statistics = await notificationService.getDeliveryStatistics({
      startDate,
      endDate,
      targetAudience
    });

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get all notifications for current user
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset, unreadOnly } = req.query;

    const notifications = await notificationService.getUserNotifications(userId, {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      data: notifications
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
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result
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
    const userId = req.user.id;

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
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
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.getNotificationById(id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new notification (admin only)
 * POST /api/notifications
 */
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, userId, type } = req.body;
    const adminId = req.user.id;

    const notification = await notificationService.createNotification({
      title,
      message,
      userId,
      type,
      createdBy: adminId
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification
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
    const { id } = req.params;
    const userId = req.user.id;
    const { isRead } = req.body;

    const notification = await notificationService.updateNotification(id, userId, { isRead });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification
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
    const { id } = req.params;
    const userId = req.user.id;

    const result = await notificationService.deleteNotification(id, userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
