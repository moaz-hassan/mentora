import express from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  registerValidator,
  validateResult,
  authController.register
);
router.post("/login", loginValidator, validateResult, authController.login);
router.post(
  "/verify-email",
  verifyEmailValidator,
  validateResult,
  authController.verifyEmail
);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validateResult,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidator,
  validateResult,
  authController.resetPassword
);

router.get("/me", authenticate, authController.getMe);

export default router;
