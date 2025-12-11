import { body, param, query } from "express-validator";

export const createCourseValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Description must be between 1 and 5000 characters"),
  
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category must not exceed 100 characters"),
  
  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Level must be beginner, intermediate, or advanced"),
  
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  
  
  
  
  body("is_published")
    .optional()
    .isBoolean()
    .withMessage("is_published must be a boolean"),
];

export const updateCourseValidator = [
  param("id")
    .notEmpty()
    .withMessage("Course ID is required"),
  
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters"),
  
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category must not exceed 100 characters"),
  
  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Level must be beginner, intermediate, or advanced"),
  
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  
  body("thumbnail_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Thumbnail URL must be a valid URL"),
  
  body("is_published")
    .optional()
    .isBoolean()
    .withMessage("is published must be a boolean"),

  body("have_discount")
    .optional()
    .isBoolean()
    .withMessage("have discount must be a boolean"),

  body("discount_type")
    .optional()
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be percentage or fixed"),

  body("discount_value")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Discount value must be a positive number"),

  body("discount_start_date")
    .optional()
    .isDate()
    .withMessage("Discount start date must be a valid date"),

  body("discount_end_date")
    .optional()
    .isDate()
    .withMessage("Discount end date must be a valid date"),
];

export const courseIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Course ID is required"),
];

export const courseQueryValidator = [
  query("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category must not exceed 100 characters"),
  
  query("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Level must be beginner, intermediate, or advanced"),
  
  query("instructor_id")
    .optional()
    .trim()
    .isUUID("4")
    .withMessage("Invalid instructor ID"),
];
