import { body, param } from "express-validator";

export const createQuizValidator = [
  body("chapter_id")
    .notEmpty()
    .withMessage("Chapter ID is required"),
  
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Quiz title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters"),

  body("order_number")
    .optional()
    .isInt({ min: 1 })
    .withMessage("order_number must be a positive integer"),

    body("questions")
    .notEmpty()
    .withMessage("Questions are required")
    .isArray()
    .withMessage("Questions must be an array"),

    body("questions.*.question")
    .trim()
    .notEmpty()
    .withMessage("Question is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Question must be between 3 and 255 characters"),

    body("questions.*.options")
    .notEmpty()
    .withMessage("Options are required")
    .isArray()
    .withMessage("Options must be an array"),

    body("questions.*.answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required")
    .isLength({ min: 1, max: 1 })
    .withMessage("Answer must be a single character"),
];

export const updateQuizValidator = [
  param("id")
    .notEmpty()
    .withMessage("Quiz ID is required"),
  
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters"),
  
  body("order_number")
    .optional()
    .isInt({ min: 1 })
    .withMessage("order_number must be a positive integer"),
  
  body("questions")
    .optional()
    .isArray()
    .withMessage("Questions must be an array"),

    body("questions.*.question")
    .trim()
    .notEmpty()
    .withMessage("Question is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Question must be between 3 and 255 characters"),

    body("questions.*.options")
    .notEmpty()
    .withMessage("Options are required")
    .isArray()
    .withMessage("Options must be an array"),

    body("questions.*.answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required")
    .isLength({ min: 1, max: 1 })
    .withMessage("Answer must be a single character"),
];


export const submitQuizValidator = [
  body("quiz_id")
    .notEmpty()
    .withMessage("Quiz ID is required"),
  
  body("student_id")
    .optional()
    .trim(),
  
  body("score")
    .notEmpty()
    .withMessage("Score is required")
    .isInt({ min: 0 })
    .withMessage("Score must be a positive integer"),
];

export const quizIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Quiz ID is required"),
];

