import express from "express";
import * as enrollmentController from "../../controllers/courses/enrollment.controller.js";
import {
  createEnrollmentValidator,
  enrollmentIdValidator,
  enrollmentQueryValidator,
  lessonIdValidator,
} from "../../validators/courses/enrollment.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  enrollmentQueryValidator,
  validateResult,
  enrollmentController.getAllEnrollments
);

// Check if user is enrolled in a course
router.get(
  "/check/:courseId",
  authenticate,
  enrollmentController.checkEnrollment
);

router.get(
  "/:id",
  authenticate,
  enrollmentIdValidator,
  validateResult,
  enrollmentController.getEnrollmentById
);

router.post(
  "/",
  authenticate,
  authorize("student"),
  createEnrollmentValidator,
  validateResult,
  enrollmentController.createEnrollment
);

router.post(
  "/:id/complete-lesson",
  authenticate,
  authorize("student"),
  enrollmentIdValidator,
  lessonIdValidator,
  validateResult,
  enrollmentController.completeLesson
);

router.put(
  "/:id/current-position",
  authenticate,
  authorize("student"),
  enrollmentIdValidator,
  lessonIdValidator,
  validateResult,
  enrollmentController.updateCurrentPosition
);

export default router;

// Course player access routes
router.get(
  "/:enrollmentId/course/:courseId/access",
  authenticate,
  authorize("student"),
  enrollmentController.verifyAccess
);

router.get(
  "/:enrollmentId/course/:courseId/player",
  authenticate,
  authorize("student"),
  enrollmentController.getCoursePlayerData
);

// Progress tracking routes
router.get(
  "/:enrollmentId/progress",
  authenticate,
  authorize("student"),
  enrollmentController.getProgress
);

router.put(
  "/:enrollmentId/progress",
  authenticate,
  authorize("student"),
  enrollmentController.updateProgress
);

router.post(
  "/:enrollmentId/lessons/:lessonId/complete",
  authenticate,
  authorize("student"),
  enrollmentController.markLessonComplete
);

// Course player access routes
router.get(
  "/:enrollmentId/course/:courseId/access",
  authenticate,
  enrollmentController.verifyAccess
);

router.get(
  "/:enrollmentId/course/:courseId/player",
  authenticate,
  enrollmentController.getCoursePlayerData
);

router.get(
  "/:enrollmentId/progress",
  authenticate,
  enrollmentController.getProgress
);

router.put(
  "/:enrollmentId/progress",
  authenticate,
  enrollmentController.updateProgress
);
