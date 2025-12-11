import express from "express";
import * as categoryController from "../../controllers/categories/category.controller.js";
import * as subCategoryController from "../../controllers/categories/subCategory.controller.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} from "../../validators/categories/category.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import cachingMiddleware from "../../middlewares/caching.middleware.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/", cachingMiddleware, categoryController.getAllCategories);

router.get(
  "/:id",
  categoryIdValidator,
  validateResult,
  categoryController.getCategoryById
);

router.get(
  "/:id/subcategories",
  categoryIdValidator,
  validateResult,
  subCategoryController.getSubCategoriesByCategory
);

// Admin-only routes - authentication and authorization required
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createCategoryValidator,
  validateResult,
  categoryController.createCategory
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateCategoryValidator,
  validateResult,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  categoryIdValidator,
  validateResult,
  categoryController.deleteCategory
);

export default router;
