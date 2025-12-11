
import express from "express";
import * as platformAnalyticsController from "../../controllers/admin/platformAnalytics.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


router.get("/enrollments", platformAnalyticsController.getEnrollmentAnalytics);


router.get("/payments", platformAnalyticsController.getPaymentAnalytics);


router.get("/users", platformAnalyticsController.getUserActivityAnalytics);


router.get("/courses", platformAnalyticsController.getCoursePerformanceAnalytics);


router.post(
  "/custom",
  body("metrics").isArray().withMessage("Metrics must be an array"),
  validateResult,
  platformAnalyticsController.generateCustomReport
);


router.post("/export", platformAnalyticsController.exportAnalytics);


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
