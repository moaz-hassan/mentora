
import express from "express";
import * as reportController from "../../controllers/reports/report.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


router.get("/", reportController.getReports);


router.get("/analytics", reportController.getReportAnalytics);


router.get("/:id", reportController.getReportById);


router.patch(
  "/:id/status",
  body("status")
    .isIn(["pending", "in-review", "resolved", "dismissed"])
    .withMessage("Invalid status"),
  validateResult,
  reportController.updateReportStatus
);


router.post(
  "/:id/notes",
  body("note").trim().notEmpty().withMessage("Note content is required"),
  validateResult,
  reportController.addInternalNote
);


router.post(
  "/:id/resolve",
  body("resolutionDetails").trim().notEmpty().withMessage("Resolution details are required"),
  validateResult,
  reportController.resolveReport
);


router.get("/:id/ai-summary", reportController.getAISummary);


router.get("/:id/ai-recommendations", reportController.getAIActionRecommendations);

export default router;
