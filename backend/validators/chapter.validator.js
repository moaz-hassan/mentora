import { body, param } from "express-validator";

export const createChapterValidator = [
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required"),
  
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Chapter title is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),  

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
];

export const updateChapterValidator = [
  param("id")
    .notEmpty()
    .withMessage("Chapter ID is required"),
  
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
];


export const chapterDeleteValidator = [
  param("id")
    .notEmpty()
    .withMessage("Chapter ID is required"),
];

