/**
 * Admin Categories Routes
 */
import express from "express";
import * as categoryController from "../../controllers/categories/category.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body, param } from "express-validator";

const router = express.Router();

// Get all categories
router.get("/", categoryController.getAllCategories);

// Search categories
router.get("/search", categoryController.searchCategories);

// Create category
router.post(
  "/",
  body("name").trim().isLength({ min: 2 }).withMessage("Category name must be at least 2 characters"),
  validateResult,
  categoryController.createCategory
);

// Update category
router.put(
  "/:id",
  param("id").notEmpty().withMessage("Category ID is required"),
  body("name").trim().isLength({ min: 2 }).withMessage("Category name must be at least 2 characters"),
  validateResult,
  categoryController.updateCategory
);

// Delete category
router.delete(
  "/:id",
  param("id").notEmpty().withMessage("Category ID is required"),
  validateResult,
  categoryController.deleteCategory
);

export default router;
