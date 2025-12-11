
import express from "express";
import * as courseController from "../../controllers/courses/course.controller.js";
import { courseIdValidator } from "../../validators/courses/course.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


router.get("/pending", courseController.getPendingCourses);


router.get(
  "/:id",
  courseIdValidator,
  validateResult,
  courseController.getAdminCourseDetails
);


router.post(
  "/:id/analyze",
  courseIdValidator,
  validateResult,
  courseController.analyzeCourse
);


router.post(
  "/:id/approve",
  courseIdValidator,
  validateResult,
  courseController.approveCourse
);


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
