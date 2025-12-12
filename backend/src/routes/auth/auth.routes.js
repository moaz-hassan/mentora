import express from "express";
import * as authController from "../../controllers/auth/auth.controller.js";
import {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../../validators/auth/auth.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../../rate-limiters/auth.limiter.js";

const router = express.Router();

// Apply stricter rate limiting to sensitive auth endpoints
router.post(
  "/register",
  registerLimiter, // 3 registrations per hour
  registerValidator,
  validateResult,
  authController.register
);
router.post(
  "/login",
  loginLimiter, // 5 attempts per 15 minutes
  loginValidator,
  validateResult,
  authController.login
);
router.post(
  "/verify-email",
  verifyEmailValidator,
  validateResult,
  authController.verifyEmail
);
router.post(
  "/forgot-password",
  passwordResetLimiter, // 3 requests per hour
  forgotPasswordValidator,
  validateResult,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  passwordResetLimiter, // 3 requests per hour
  resetPasswordValidator,
  validateResult,
  authController.resetPassword
);


router.get("/me", authenticate, authController.getMe);


router.post(
  "/change-password",
  authenticate,
  authController.changePassword
);

router.post(
  "/resend-verification-email",
  authenticate,
  authController.resendVerificationEmail
);

export default router;
