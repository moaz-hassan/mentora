
import express from "express";
import * as notificationController from "../../controllers/communication/notification.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


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


router.get("/history", notificationController.getNotificationHistory);


router.get("/statistics", notificationController.getDeliveryStatistics);


router.get("/scheduled", notificationController.getScheduledNotifications);


router.get("/:id/metrics", notificationController.getNotificationMetrics);


router.post("/:id/send", notificationController.sendScheduledNotification);


router.delete("/:id/cancel", notificationController.cancelScheduledNotification);

export default router;
