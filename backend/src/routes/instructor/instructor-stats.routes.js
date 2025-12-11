import express from "express";
import * as instructorStatsController from "../../controllers/instructor/instructor-stats.controller.js";

const router = express.Router();

router.get("/:instructorId/stats", instructorStatsController.getInstructorStats);

export default router;

