/**
 * Admin Reports Routes
 */
import express from "express";
import * as reportController from "../../controllers/reports/report.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Get all reports (with enhanced filters)
router.get("/", reportController.getReports);

// Get report analytics
router.get("/analytics", reportController.getReportAnalytics);

// Get report by ID
router.get("/:id", reportController.getReportById);

// Update report status
router.patch(
  "/:id/status",
  body("status")
    .isIn(["pending", "in-review", "resolved", "dismissed"])
    .withMessage("Invalid status"),
  validateResult,
  reportController.updateReportStatus
);

// Add internal note
router.post(
  "/:id/notes",
  body("note").trim().notEmpty().withMessage("Note content is required"),
  validateResult,
  reportController.addInternalNote
);

// Resolve report
router.post(
  "/:id/resolve",
  body("resolutionDetails").trim().notEmpty().withMessage("Resolution details are required"),
  validateResult,
  reportController.resolveReport
);

// Get AI summary
router.get("/:id/ai-summary", reportController.getAISummary);

// Get AI recommendations
router.get("/:id/ai-recommendations", reportController.getAIActionRecommendations);

export default router;
