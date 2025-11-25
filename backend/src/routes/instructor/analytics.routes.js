/**
 * Instructor Analytics Routes
 */
import express from "express";
import * as instructorController from "../../controllers/instructor/courses.controller.js";
import * as analyticsController from "../../controllers/instructor/analytics.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validateAnalyticsQuery } from "../../validators/instructor/instructor.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";

const router = express.Router();

// All routes require instructor authentication
router.use(authenticate);
router.use(authorize("instructor"));

// Get comprehensive analytics
router.get(
  "/",
  validateAnalyticsQuery,
  validateResult,
  instructorController.getAnalytics
);

// Export analytics
router.get(
  "/export",
  validateAnalyticsQuery,
  validateResult,
  instructorController.exportAnalytics
);

// Revenue analytics
router.get("/revenue", analyticsController.getRevenueAnalytics);

// Enrollment trend
router.get("/enrollments", analyticsController.getEnrollmentTrend);

// Generate comprehensive report
router.post("/report", analyticsController.generateReport);

export default router;
