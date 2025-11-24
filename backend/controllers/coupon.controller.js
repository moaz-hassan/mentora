import * as couponService from "../services/coupon.service.js";

export const getAllCouponsByAdmin = async (req, res, next) => {
  try {
    const coupons = await couponService.getAllCouponsByAdmin();
    res.status(200).json({
      success: true,
      message: "Coupons retrieved successfully",
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCouponsByInstructor = async (req, res, next) => {
  try {
    const coupon = await couponService.getAllCouponsByInstructor(req.user.id);
    res.status(200).json({
      success: true,
      message: "Coupons retrieved successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.updateCoupon(req.body, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { coupon_id } = req.body;
    await couponService.deleteCoupon(coupon_id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, course_id } = req.body;
    const coupon = await couponService.validateCoupon(code, course_id);
    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};
