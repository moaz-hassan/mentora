/**
 * Instructor Statistics Routes
 */
import express from "express";
import * as instructorStatsController from "../../controllers/instructor/instructor-stats.controller.js";

const router = express.Router();

// Get instructor statistics (public route - no auth needed)
router.get("/:instructorId/stats", instructorStatsController.getInstructorStats);

export default router;

