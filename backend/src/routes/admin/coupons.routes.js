/**
 * Admin Coupons Routes
 */
import express from "express";
import * as couponController from "../../controllers/payments/coupon.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Get all coupons
router.get("/", couponController.getAllCouponsByAdmin);

// Search coupons
router.get("/search", couponController.searchCoupons);

// Get coupon analytics
router.get("/analytics", couponController.getCouponAnalytics);

// Deactivate expired coupons
router.post("/deactivate-expired", couponController.deactivateExpiredCoupons);

// Create coupon
router.post(
  "/",
  body("code").trim().notEmpty().withMessage("Coupon code is required"),
  body("discount_type").isIn(["percentage", "fixed"]).withMessage("Discount type must be 'percentage' or 'fixed'"),
  body("discount_value").isFloat({ gt: 0 }).withMessage("Discount value must be greater than 0"),
  validateResult,
  couponController.createCoupon
);

// Update coupon
router.put("/:id", couponController.updateCoupon);

// Delete coupon
router.delete("/:id", couponController.deleteCoupon);

// Update coupon status
router.patch(
  "/:id/status",
  body("status").isIn(["active", "inactive"]).withMessage("Status must be 'active' or 'inactive'"),
  validateResult,
  couponController.updateCoupon
);

// Get specific coupon analytics
router.get("/:id/analytics", couponController.getCouponAnalytics);

export default router;
