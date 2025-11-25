/**
 * Admin Notifications Routes
 */
import express from "express";
import * as notificationController from "../../controllers/communication/notification.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Broadcast notification
router.post(
  "/broadcast",
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("targetAudience")
    .isIn(["all", "students", "instructors"])
    .withMessage("Target audience must be 'all', 'students', or 'instructors'"),
  validateResult,
  notificationController.broadcastNotification
);

// Get notification history
router.get("/history", notificationController.getNotificationHistory);

// Get delivery statistics
router.get("/statistics", notificationController.getDeliveryStatistics);

// Get scheduled notifications
router.get("/scheduled", notificationController.getScheduledNotifications);

// Get notification metrics
router.get("/:id/metrics", notificationController.getNotificationMetrics);

// Send scheduled notification
router.post("/:id/send", notificationController.sendScheduledNotification);

// Cancel scheduled notification
router.delete("/:id/cancel", notificationController.cancelScheduledNotification);

export default router;
