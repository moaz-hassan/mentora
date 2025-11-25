import express from "express";
import * as subCategoryController from "../../controllers/categories/subCategory.controller.js";
import {
  createSubCategoryValidator,
  updateSubCategoryValidator,
  subCategoryIdValidator,
} from "../../validators/categories/subCategory.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/", subCategoryController.getAllSubCategories);

router.get(
  "/:id",
  subCategoryIdValidator,
  validateResult,
  subCategoryController.getSubCategoryById
);

// Admin-only routes - authentication and authorization required
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createSubCategoryValidator,
  validateResult,
  subCategoryController.createSubCategory
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateSubCategoryValidator,
  validateResult,
  subCategoryController.updateSubCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  subCategoryIdValidator,
  validateResult,
  subCategoryController.deleteSubCategory
);

export default router;
