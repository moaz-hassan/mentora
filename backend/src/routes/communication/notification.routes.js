import express from "express";
import * as notificationController from "../../controllers/communication/notification.controller.js";
import { createNotificationValidator, updateNotificationValidator, notificationIdValidator } from "../../validators/communication/notification.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/notifications - Get all notifications for current user
router.get("/", authenticate, notificationController.getNotifications);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put("/mark-all-read", authenticate, notificationController.markAllAsRead);

// GET /api/notifications/unread-count - Get unread notification count
router.get("/unread-count", authenticate, notificationController.getUnreadCount);

// GET /api/notifications/:id - Get notification by ID
router.get("/:id", authenticate, notificationIdValidator, validateResult, notificationController.getNotificationById);

// POST /api/notifications - Create a new notification (admin only)
router.post("/", authenticate, authorize("admin"), createNotificationValidator, validateResult, notificationController.createNotification);

// PUT /api/notifications/:id - Update notification (mark as read)
router.put("/:id", authenticate, updateNotificationValidator, validateResult, notificationController.updateNotification);

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", authenticate, notificationIdValidator, validateResult, notificationController.deleteNotification);

export default router;
