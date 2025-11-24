import { body } from "express-validator";

export const createReviewValidator = [
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required"),
  
  body("student_id")
    .notEmpty()
    .withMessage("Student ID is required"),
  
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  
  body("review")
  .optional()
    .notEmpty()
    .withMessage("Review is required"),
];

export const updateReviewValidator = [
  body("review_id")
    .notEmpty()
    .withMessage("Review ID is required"),
  
  body("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  
  body("review")
    .optional()
    .notEmpty()
    .withMessage("Review is required"),
];

export const reviewIdValidator = [
  body("review_id")
    .notEmpty()
    .withMessage("Review ID is required"),
];

export const reviewQueryValidator = [
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required"),
  
  body("student_id")
    .notEmpty()
    .withMessage("Student ID is required"),
];
