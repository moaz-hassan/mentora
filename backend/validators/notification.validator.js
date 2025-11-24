/**
 * Notification Validators
 * Purpose: Validate notification-related requests
 */

import { body, param } from "express-validator";

export const createNotificationValidator = [
  body("user_id")
    .notEmpty()
    .withMessage("User ID is required"),
  
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required"),
  
  body("type")
    .optional()
    .isIn(["info", "success", "warning", "error"])
    .withMessage("Type must be info, success, warning, or error"),
];

export const updateNotificationValidator = [
  param("id")
    .notEmpty()
    .withMessage("Notification ID is required"),
  
  body("is_read")
    .optional()
    .isBoolean()
    .withMessage("is_read must be a boolean"),
];

export const notificationIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Notification ID is required"),
];
