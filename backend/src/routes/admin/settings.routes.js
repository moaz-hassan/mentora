
import express from "express";
import * as settingsController from "../../controllers/admin/settings.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body, param } from "express-validator";

const router = express.Router();


router.get("/", settingsController.getAllSettings);


router.get("/:category", settingsController.getSettingsByCategory);


router.post(
  "/",
  body("key").trim().notEmpty().withMessage("Setting key is required"),
  body("value").notEmpty().withMessage("Setting value is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  validateResult,
  settingsController.createSetting
);


router.put(
  "/:key",
  param("key").notEmpty().withMessage("Setting key is required"),
  body("value").notEmpty().withMessage("Setting value is required"),
  validateResult,
  settingsController.updateSetting
);


router.post(
  "/bulk",
  body("updates").isArray().withMessage("Updates must be an array"),
  validateResult,
  settingsController.bulkUpdateSettings
);

export default router;
