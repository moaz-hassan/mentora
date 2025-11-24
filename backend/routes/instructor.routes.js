import express from "express";
import * as instructorController from "../controllers/instructor.controller.js";
import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateAnalyticsQuery } from "../validators/instructor.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";

const router = express.Router();

// Course management
router.get(
  "/all-courses",
  authenticate,
  authorize("instructor"),
  instructorController.getAllCourses
);

// Analytics endpoints
router.get(
  "/analytics",
  authenticate,
  authorize("instructor"),
  validateAnalyticsQuery,
  validateResult,
  instructorController.getAnalytics
);

router.get(
  "/analytics/export",
  authenticate,
  authorize("instructor"),
  validateAnalyticsQuery,
  validateResult,
  instructorController.exportAnalytics
);

// Revenue analytics endpoint
router.get(
  "/analytics/revenue",
  authenticate,
  authorize("instructor"),
  analyticsController.getRevenueAnalytics
);

// Enrollment trend endpoint
router.get(
  "/analytics/enrollments",
  authenticate,
  authorize("instructor"),
  analyticsController.getEnrollmentTrend
);

// Generate comprehensive report endpoint
router.post(
  "/analytics/report",
  authenticate,
  authorize("instructor"),
  analyticsController.generateReport
);

export default router;
