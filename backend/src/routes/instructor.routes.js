import express from "express";
import { getInstructorStats } from "../controllers/instructor/instructor-stats.controller.js";

const router = express.Router();

// GET /api/instructor/:instructorId/stats - Get instructor statistics
router.get("/:instructorId/stats", getInstructorStats);

export default router;
