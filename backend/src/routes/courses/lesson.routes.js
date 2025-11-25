import express from "express";
import * as lessonController from "../../controllers/courses/lesson.controller.js";
import { createLessonValidator, updateLessonValidator, lessonIdValidator } from "../../validators/courses/lesson.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { uploadVideo, handleMulterError } from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/:id", authenticate, lessonIdValidator, validateResult, lessonController.getLessonById);

router.post(
  "/",
  authenticate,
  authorize("instructor"),
  createLessonValidator,
  validateResult,
  lessonController.createLesson
);

router.put("/:id", authenticate, authorize("instructor"), updateLessonValidator, validateResult, lessonController.updateLesson);

router.delete("/:id", authenticate, authorize("instructor", "admin"), lessonIdValidator, validateResult, lessonController.deleteLesson);

export default router;
