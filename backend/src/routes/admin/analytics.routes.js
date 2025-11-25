/**
 * Admin Analytics Routes
 */
import express from "express";
import * as adminAnalyticsController from "../../controllers/admin/analytics.controller.js";

const router = express.Router();

// Get platform overview
router.get("/overview", adminAnalyticsController.getPlatformOverview);

// Get revenue analytics
router.get("/revenue", adminAnalyticsController.getRevenueAnalytics);

// Get user growth analytics
router.get("/users", adminAnalyticsController.getUserGrowthAnalytics);

// Get enrollment analytics
router.get("/enrollments", adminAnalyticsController.getEnrollmentAnalytics);

// Get course performance analytics
router.get("/courses", adminAnalyticsController.getCoursePerformanceAnalytics);

// Export analytics data
router.post("/export", adminAnalyticsController.exportAnalyticsData);

export default router;
