/**
 * Admin Instructor Management Routes
 */
import express from "express";
import * as instructorManagementController from "../../controllers/admin/instructors.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Get all instructors
router.get("/", instructorManagementController.getAllInstructors);

// Get instructor details
router.get("/:id", instructorManagementController.getInstructorDetails);

// Get instructor analytics
router.get("/:id/analytics", instructorManagementController.getInstructorAnalytics);

// Update instructor status
router.patch(
  "/:id/status",
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
  validateResult,
  instructorManagementController.updateInstructorStatus
);

// Get instructor payouts
router.get("/:id/payouts", instructorManagementController.getInstructorPayouts);

export default router;
