import express from "express";
import * as courseController from "../controllers/course.controller.js";
import * as chapterController from "../controllers/chapter.controller.js";
import { courseIdValidator } from "../validators/course.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Course review routes
router.get("/courses/pending", courseController.getPendingCourses);

router.post(
  "/courses/:id/approve",
  courseIdValidator,
  validateResult,
  courseController.approveCourse
);

router.post(
  "/courses/:id/reject",
  courseIdValidator,
  body("rejection_reason")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Rejection reason must be at least 10 characters long"),
  validateResult,
  courseController.rejectCourse
);

// Chapter review routes
router.get("/chapters/pending", chapterController.getPendingChapters);

router.post(
  "/chapters/:id/approve",
  body("id").notEmpty().withMessage("Chapter ID is required"),
  validateResult,
  chapterController.approveChapter
);

router.post(
  "/chapters/:id/reject",
  body("id").notEmpty().withMessage("Chapter ID is required"),
  body("rejection_reason")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Rejection reason must be at least 10 characters long"),
  validateResult,
  chapterController.rejectChapter
);

export default router;
