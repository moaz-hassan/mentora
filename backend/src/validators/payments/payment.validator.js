/**
 * Payment Validators
 * Purpose: Validate payment-related requests
 */

import { body, param, query } from "express-validator";

export const createPaymentValidator = [
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required"),
  
  body("user_id")
    .optional()
    .trim(),
  
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  
  body("currency")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Currency code must not exceed 10 characters"),
  
  body("payment_method")
    .optional()
    .isIn(["card", "paypal", "stripe"])
    .withMessage("Payment method must be card, paypal, or stripe"),
  
  body("status")
    .optional()
    .isIn(["pending", "completed", "failed"])
    .withMessage("Status must be pending, completed, or failed"),
];

export const updatePaymentValidator = [
  param("id")
    .notEmpty()
    .withMessage("Payment ID is required"),
  
  body("status")
    .optional()
    .isIn(["pending", "completed", "failed"])
    .withMessage("Status must be pending, completed, or failed"),
];

export const paymentIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Payment ID is required"),
];

export const paymentQueryValidator = [
  query("user_id")
    .optional()
    .trim(),
  
  query("course_id")
    .optional()
    .trim(),
  
  query("status")
    .optional()
    .isIn(["pending", "completed", "failed"])
    .withMessage("Status must be pending, completed, or failed"),
];
