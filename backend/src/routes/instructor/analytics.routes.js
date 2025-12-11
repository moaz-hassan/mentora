
import express from "express";
import * as instructorController from "../../controllers/instructor/courses.controller.js";
import * as analyticsController from "../../controllers/instructor/analytics.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validateAnalyticsQuery } from "../../validators/instructor/instructor.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";

const router = express.Router();


router.use(authenticate);
router.use(authorize("instructor"));


router.get(
  "/",
  validateAnalyticsQuery,
  validateResult,
  instructorController.getAnalytics
);


router.get(
  "/export",
  validateAnalyticsQuery,
  validateResult,
  instructorController.exportAnalytics
);


router.get("/revenue", analyticsController.getRevenueAnalytics);


router.get("/enrollments", analyticsController.getEnrollmentTrend);


router.post("/report", analyticsController.generateReport);

export default router;
