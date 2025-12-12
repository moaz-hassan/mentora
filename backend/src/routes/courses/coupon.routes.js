import express from "express";
import * as couponController from "../../controllers/payments/coupon.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import {
  createCouponValidator,
  updateCouponValidator,
  validateCouponValidator,
  deleteCouponValidator,
} from "../../validators/payments/coupon.validator.js";

const router = express.Router();

router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  validateResult,
  couponController.getAllCouponsByAdmin
);

router.get(
  "/instructor",
  authenticate,
  authorize("instructor"),
  validateResult,
  couponController.getAllCouponsByInstructor
);

router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  createCouponValidator,
  validateResult,
  couponController.createCoupon
);

router.put(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  updateCouponValidator,
  validateResult,
  couponController.updateCoupon
);

router.delete(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  deleteCouponValidator,
  validateResult,
  couponController.deleteCoupon
);

router.post(
  "/validate",
  authenticate,
  validateCouponValidator,
  validateResult,
  couponController.validateCoupon
);

// Public route - no auth required - for homepage promo banner
router.get(
  "/global-promo",
  couponController.getActiveGlobalCoupon
);

export default router;
