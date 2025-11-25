import { body, param } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Category name must be between 1 and 100 characters"),
];

export const updateCategoryValidator = [
  param("id")
    .notEmpty()
    .withMessage("Category ID is required"),
  
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Category name must be between 1 and 100 characters"),
];

export const categoryIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Category ID is required"),
];
