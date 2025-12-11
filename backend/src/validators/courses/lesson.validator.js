
import { body, param } from "express-validator";

export const createLessonValidator = [
  body("chapter_id")
    .notEmpty()
    .withMessage("Chapter ID is required"),
  
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Lesson title is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  
  body("lesson_type")
    .optional()
    .isIn(["video", "text"])
    .withMessage("Lesson type must be either 'video' or 'text'"),
  
  
  
  
  body("content")
    .optional()
    .trim(),
  
  body("duration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Duration must be a positive integer (in seconds)"),
  
];

export const updateLessonValidator = [
  param("id")
    .notEmpty()
    .withMessage("Lesson ID is required"),
  
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters"),
  
  body("video_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Video URL must be a valid URL"),
  
  body("content")
    .optional()
    .trim(),
  
  body("duration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Duration must be a positive integer (in seconds)"),
];

export const lessonIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Lesson ID is required"),
];
