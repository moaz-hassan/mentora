import { body, param, query } from "express-validator";

export const createEnrollmentValidator = [
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required"),
];

export const lessonIdValidator = [
  body("lesson_id")
    .notEmpty()
    .withMessage("Lesson ID is required")
    .isUUID()
    .withMessage("Lesson ID must be a valid UUID"),
];

export const enrollmentIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Enrollment ID is required"),
];

export const enrollmentQueryValidator = [
  query("student_id")
    .optional()
    .trim(),
  
  query("course_id")
    .optional()
    .trim(),
];
