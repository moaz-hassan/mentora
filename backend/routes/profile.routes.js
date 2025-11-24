import express from "express";
import * as profileController from "../controllers/profile.controller.js";
import { updateProfileValidator } from "../validators/profile.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/profile - Get current user's profile
router.get("/", authenticate, profileController.getProfile);

// PUT /api/profile - Update current user's profile
router.put("/", authenticate, updateProfileValidator, validateResult, profileController.updateProfile);

export default router;
