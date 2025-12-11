

import * as notificationService from "../../services/communication/notification.service.js";


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
