/**
 * Admin Logs Routes
 */
import express from "express";
import * as logsController from "../../controllers/admin/logs.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Get audit logs
router.get("/audit", logsController.getAuditLogs);

// Get payment logs
router.get("/payments", logsController.getPaymentLogs);

// Get enrollment logs
router.get("/enrollments", logsController.getEnrollmentLogs);

// Get error logs
router.get("/errors", logsController.getErrorLogs);

// Get log analytics
router.get("/analytics", logsController.getLogAnalytics);

// Search all logs
router.get("/search", logsController.searchAllLogs);

// Export logs
router.post(
  "/export",
  body("logType")
    .isIn(["audit", "payment", "enrollment", "error"])
    .withMessage("Invalid log type"),
  validateResult,
  logsController.exportLogs
);

export default router;
