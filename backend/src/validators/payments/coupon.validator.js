import { body } from "express-validator";

export const createCouponValidator = [
  body("course_id").notEmpty().withMessage("Course ID is required"),
  body("code").notEmpty().withMessage("Coupon code is required"),
  body("is_active").isBoolean().withMessage("Invalid is_active value"),
  body("discount_type")
    .isIn(["percentage", "fixed"])
    .withMessage("Invalid discount type"),
  body("discount_value").isDecimal().withMessage("Invalid discount value"),
  body("discount_start_date").isDate().withMessage("Invalid start date"),
  body("discount_end_date").isDate().withMessage("Invalid end date"),
  body("max_count").isInt().withMessage("Invalid max count"),
];

export const updateCouponValidator = [
  body("coupon_id").notEmpty().withMessage("Coupon ID is required"),
  body("is_active").optional().isBoolean().withMessage("Invalid is_active value"),
  body("discount_end_date")
    .optional()
    .isDate()
    .withMessage("Invalid end date"),
  body("max_count").optional().isInt().withMessage("Invalid max count"),
];

export const validateCouponValidator = [
  body("coupon_code").notEmpty().withMessage("Coupon code is required"),
  body("course_id").notEmpty().withMessage("Course ID is required"),
];

export const deleteCouponValidator = [
  body("coupon_id").notEmpty().withMessage("Coupon ID is required"),
];
