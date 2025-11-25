/**
 * Admin Courses Routes (Course Review)
 */
import express from "express";
import * as courseController from "../../controllers/courses/course.controller.js";
import { courseIdValidator } from "../../validators/courses/course.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Get pending courses
router.get("/pending", courseController.getPendingCourses);

// Analyze course with AI
router.post(
  "/:id/analyze",
  courseIdValidator,
  validateResult,
  courseController.analyzeCourse
);

// Approve course
router.post(
  "/:id/approve",
  courseIdValidator,
  validateResult,
  courseController.approveCourse
);

// Reject course
router.post(
  "/:id/reject",
  courseIdValidator,
  body("rejection_reason")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Rejection reason must be at least 10 characters long"),
  validateResult,
  courseController.rejectCourse
);

export default router;
