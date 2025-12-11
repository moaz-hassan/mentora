

import { body, param } from "express-validator";

export const createUserValidator = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),
  
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  
  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Role must be student, instructor, or admin"),
];

export const updateUserValidator = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required"),
  
  body("full_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),
  
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  
  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Role must be student, instructor, or admin"),
];

export const userIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required"),
];

export const updateUserProfileValidator = [
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("First name must be between 2 and 255 characters"),
  
  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Last name must be between 2 and 255 characters"),
];
