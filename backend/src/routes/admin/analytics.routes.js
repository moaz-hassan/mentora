
import express from "express";
import * as adminAnalyticsController from "../../controllers/admin/analytics.controller.js";

const router = express.Router();


router.get("/overview", adminAnalyticsController.getPlatformOverview);


router.get("/revenue", adminAnalyticsController.getRevenueAnalytics);


router.get("/users", adminAnalyticsController.getUserGrowthAnalytics);


router.get("/enrollments", adminAnalyticsController.getEnrollmentAnalytics);


router.get("/courses", adminAnalyticsController.getCoursePerformanceAnalytics);


router.post("/export", adminAnalyticsController.exportAnalyticsData);

export default router;
