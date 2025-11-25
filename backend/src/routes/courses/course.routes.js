import express from "express";
import * as courseController from "../../controllers/courses/course.controller.js";
import {
  createCourseValidator,
  updateCourseValidator,
  courseIdValidator,
  courseQueryValidator,
} from "../../validators/courses/course.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import {
  uploadThumbnail,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.get(
  "/",
  courseQueryValidator,
  validateResult,
  courseController.getAllCourses
);
router.post(
  "/",
  authenticate,
  authorize("instructor"),
  uploadThumbnail,
  handleMulterError,
  createCourseValidator,
  validateResult,
  courseController.createCourse
);

router.put(
  "/:id/intro-video",
  authenticate,
  authorize("instructor"),
  courseIdValidator,
  validateResult,
  courseController.updateCourseIntroVideo
);

router.post(
  "/:id/save-draft",
  authenticate,
  authorize("instructor"),
  courseIdValidator,
  validateResult,
  courseController.saveDraft
);

router.post(
  "/:id/submit-review",
  authenticate,
  authorize("instructor"),
  courseIdValidator,
  validateResult,
  courseController.submitForReview
);
router.get(
  "/:id",
  courseIdValidator,
  validateResult,
  courseController.getCourseById
);
router.put(
  "/:id",
  authenticate,
  authorize("instructor"),
  updateCourseValidator,
  validateResult,
  courseController.updateCourse
);
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  courseIdValidator,
  validateResult,
  courseController.deleteCourse
);

export default router;
