import express from "express";
import * as notificationController from "../../controllers/communication/notification.controller.js";
import { createNotificationValidator, updateNotificationValidator, notificationIdValidator } from "../../validators/communication/notification.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/", authenticate, notificationController.getNotifications);


router.put("/mark-all-read", authenticate, notificationController.markAllAsRead);


router.get("/unread-count", authenticate, notificationController.getUnreadCount);


router.get("/:id", authenticate, notificationIdValidator, validateResult, notificationController.getNotificationById);


router.post("/", authenticate, authorize("admin"), createNotificationValidator, validateResult, notificationController.createNotification);


router.put("/:id", authenticate, updateNotificationValidator, validateResult, notificationController.updateNotification);


router.delete("/:id", authenticate, notificationIdValidator, validateResult, notificationController.deleteNotification);

export default router;
