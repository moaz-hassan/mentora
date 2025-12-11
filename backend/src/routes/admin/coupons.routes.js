
import express from "express";
import * as couponController from "../../controllers/payments/coupon.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


router.get("/", couponController.getAllCouponsByAdmin);


router.get("/search", couponController.searchCoupons);


router.get("/analytics", couponController.getCouponAnalytics);


router.post("/deactivate-expired", couponController.deactivateExpiredCoupons);


router.post(
  "/",
  body("code").trim().notEmpty().withMessage("Coupon code is required"),
  body("discount_type").isIn(["percentage", "fixed"]).withMessage("Discount type must be 'percentage' or 'fixed'"),
  body("discount_value").isFloat({ gt: 0 }).withMessage("Discount value must be greater than 0"),
  validateResult,
  couponController.createCoupon
);


router.put("/:id", couponController.updateCoupon);


router.delete("/:id", couponController.deleteCoupon);


router.patch(
  "/:id/status",
  body("status").isIn(["active", "inactive"]).withMessage("Status must be 'active' or 'inactive'"),
  validateResult,
  couponController.updateCoupon
);


router.get("/:id/analytics", couponController.getCouponAnalytics);

export default router;
