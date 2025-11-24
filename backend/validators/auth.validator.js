import { body } from "express-validator";

export const registerValidator = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("First name must be between 2 and 255 characters"),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Last name must be between 2 and 255 characters"),

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
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .withMessage(
      "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Role must be student, instructor, or admin"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

export const verifyEmailValidator = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("token").notEmpty().withMessage("Token is required"),
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Please enter a valid email"),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("token").notEmpty().withMessage("Token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

