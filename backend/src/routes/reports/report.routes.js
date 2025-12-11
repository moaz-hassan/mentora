import express from "express";
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  getAISummary,
  getAIActionRecommendations,
  getReportStats,
} from "../../controllers/reports/report.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/", authenticate, createReport);
router.get("/", authenticate, authorize("admin"), getReports);
router.get("/stats", authenticate, authorize("admin"), getReportStats);
router.get("/:id", authenticate, authorize("admin"), getReportById);
router.patch("/:id/status", authenticate, authorize("admin"), updateReportStatus);
router.get("/:id/ai-summary", authenticate, authorize("admin"), getAISummary);
router.get("/:id/recommendations", authenticate, authorize("admin"), getAIActionRecommendations);

export default router;
