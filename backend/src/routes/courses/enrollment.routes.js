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
import cachingMiddleware from "../../middlewares/caching.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  enrollmentQueryValidator,
  validateResult,
  enrollmentController.getAllEnrollments
);

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

router.get(
  "/:enrollmentId/lessons/:lessonId",
  authenticate,
  enrollmentController.getLessonDetail
);

router.post(
  "/:enrollmentId/lessons/:lessonId/complete",
  authenticate,
  enrollmentController.markLessonComplete
);

router.get(
  "/:enrollmentId/quizzes/:quizId",
  authenticate,
  enrollmentController.getQuizDetail
);

router.post(
  "/:enrollmentId/quizzes/:quizId/submit",
  authenticate,
  enrollmentController.submitQuiz
);

router.post("/gift", authenticate, enrollmentController.giftCourse);

export default router;
