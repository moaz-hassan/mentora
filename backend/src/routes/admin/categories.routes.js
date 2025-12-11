
import express from "express";
import * as categoryController from "../../controllers/categories/category.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body, param } from "express-validator";

const router = express.Router();


router.get("/", categoryController.getAllCategories);


router.get("/search", categoryController.searchCategories);


router.post(
  "/",
  body("name").trim().isLength({ min: 2 }).withMessage("Category name must be at least 2 characters"),
  validateResult,
  categoryController.createCategory
);


router.put(
  "/:id",
  param("id").notEmpty().withMessage("Category ID is required"),
  body("name").trim().isLength({ min: 2 }).withMessage("Category name must be at least 2 characters"),
  validateResult,
  categoryController.updateCategory
);


router.delete(
  "/:id",
  param("id").notEmpty().withMessage("Category ID is required"),
  validateResult,
  categoryController.deleteCategory
);

export default router;
