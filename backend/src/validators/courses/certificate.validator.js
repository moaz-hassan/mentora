

import { body, param, query } from "express-validator";

export const createCertificateValidator = [
  body("student_id")
    .notEmpty()
    .withMessage("Student ID is required"),
  
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required"),
  
  body("certificate_url")
    .trim()
    .notEmpty()
    .withMessage("Certificate URL is required")
    .isURL()
    .withMessage("Certificate URL must be a valid URL"),
  
  body("verified")
    .optional()
    .isBoolean()
    .withMessage("Verified must be a boolean"),
];

export const updateCertificateValidator = [
  param("id")
    .notEmpty()
    .withMessage("Certificate ID is required"),
  
  body("certificate_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Certificate URL must be a valid URL"),
  
  body("verified")
    .optional()
    .isBoolean()
    .withMessage("Verified must be a boolean"),
];

export const certificateIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Certificate ID is required"),
];

export const certificateQueryValidator = [
  query("student_id")
    .optional()
    .trim(),
  
  query("course_id")
    .optional()
    .trim(),
  
  query("verified")
    .optional()
    .isBoolean()
    .withMessage("Verified must be a boolean"),
];
