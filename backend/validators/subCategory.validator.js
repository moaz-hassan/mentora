import { body, param } from "express-validator";

export const createSubCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Subcategory name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Subcategory name must be between 1 and 100 characters"),
  
  body("category_id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isUUID("4")
    .withMessage("Category ID must be a valid UUID"),
];

export const updateSubCategoryValidator = [
  param("id")
    .notEmpty()
    .withMessage("Subcategory ID is required"),
  
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Subcategory name must be between 1 and 100 characters"),
  
  body("category_id")
    .optional()
    .isUUID("4")
    .withMessage("Category ID must be a valid UUID"),
];

export const subCategoryIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Subcategory ID is required"),
];
