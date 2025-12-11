import * as couponService from "../../services/payments/coupon.service.js";

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
    const coupon = await couponService.createCoupon(req.body, req.user.id, req.user.role);
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
    const { coupon_code, course_id } = req.body;
    const coupon = await couponService.validateCoupon(coupon_code, course_id);
    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coupon analytics
 * GET /api/admin/coupons/analytics
 * GET /api/admin/coupons/:id/analytics
 */
export const getCouponAnalytics = async (req, res, next) => {
  try {
    const couponId = req.params.id || null;
    const analytics = await couponService.getCouponAnalytics(couponId);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search coupons
 * GET /api/admin/coupons/search?q=searchTerm&status=active&courseId=123
 */
export const searchCoupons = async (req, res, next) => {
  try {
    const { q, status, courseId } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (courseId) filters.courseId = courseId;
    
    const coupons = await couponService.searchCoupons(q, filters);
    
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate expired coupons
 * POST /api/admin/coupons/deactivate-expired
 */
export const deactivateExpiredCoupons = async (req, res, next) => {
  try {
    const result = await couponService.deactivateExpiredCoupons();
    
    res.status(200).json({
      success: true,
      message: `Deactivated ${result.deactivatedCount} expired coupons`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
