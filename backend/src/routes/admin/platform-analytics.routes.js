/**
 * Admin Platform Analytics Routes
 */
import express from "express";
import * as platformAnalyticsController from "../../controllers/admin/platformAnalytics.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Get enrollment analytics
router.get("/enrollments", platformAnalyticsController.getEnrollmentAnalytics);

// Get payment analytics
router.get("/payments", platformAnalyticsController.getPaymentAnalytics);

// Get user activity analytics
router.get("/users", platformAnalyticsController.getUserActivityAnalytics);

// Get course performance analytics
router.get("/courses", platformAnalyticsController.getCoursePerformanceAnalytics);

// Generate custom report
router.post(
  "/custom",
  body("metrics").isArray().withMessage("Metrics must be an array"),
  validateResult,
  platformAnalyticsController.generateCustomReport
);

// Export analytics
router.post("/export", platformAnalyticsController.exportAnalytics);

// Schedule report
router.post(
  "/schedule",
  body("name").trim().notEmpty().withMessage("Report name is required"),
  body("metrics").isArray().withMessage("Metrics must be an array"),
  body("frequency")
    .isIn(["daily", "weekly", "monthly"])
    .withMessage("Frequency must be 'daily', 'weekly', or 'monthly'"),
  body("recipients").isArray().withMessage("Recipients must be an array"),
  validateResult,
  platformAnalyticsController.scheduleReport
);

export default router;
