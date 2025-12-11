import express from "express";
import { getInstructorStats } from "../controllers/instructor/instructor-stats.controller.js";

const router = express.Router();


router.get("/:instructorId/stats", getInstructorStats);

export default router;
