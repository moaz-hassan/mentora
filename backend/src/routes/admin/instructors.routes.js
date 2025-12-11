
import express from "express";
import * as instructorManagementController from "../../controllers/admin/instructors.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


router.get("/", instructorManagementController.getAllInstructors);


router.get("/:id", instructorManagementController.getInstructorDetails);


router.get("/:id/analytics", instructorManagementController.getInstructorAnalytics);


router.patch(
  "/:id/status",
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
  validateResult,
  instructorManagementController.updateInstructorStatus
);


router.get("/:id/payouts", instructorManagementController.getInstructorPayouts);

export default router;
