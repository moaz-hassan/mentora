import couponRepository from "../../repositories/payments/coupon.repository.js";
import paymentRepository from "../../repositories/payments/payment.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";

export const getAllCouponsByAdmin = async () => {
  return await couponRepository.findAll();
};

export const getAllCouponsByInstructor = async (instructorId) => {
  const courses = await courseRepository.find({ instructor_id: instructorId });

  const result = await Promise.all(
    courses.map(async (course) => {
      const coupons = await couponRepository.findByCourseId(course._id.toString());
      return {
        title: course.title,
        Coupons: coupons.map((c) => ({
          code: c.code,
          discount_type: c.discount_type,
          discount_value: c.discount_value,
          discount_start_date: c.discount_start_date,
          discount_end_date: c.discount_end_date,
          max_count: c.max_count,
          used_count: c.used_count,
        })),
      };
    })
  );

  return result;
};

export const createCoupon = async (couponData, userId, userRole) => {
  if (couponData.course_id) {
    const course = await courseRepository.findById(couponData.course_id);

    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== "admin" && course.instructor_id !== userId) {
      const error = new Error("You are not authorized to create a coupon for this course");
      error.statusCode = 403;
      throw error;
    }
    couponData.is_global = false;
  } else {
    if (userRole !== "admin") {
      const error = new Error("Only admins can create coupons applicable to all courses");
      error.statusCode = 403;
      throw error;
    }

    const existingGlobalCoupon = await couponRepository.findActiveGlobalCoupon();

    if (existingGlobalCoupon) {
      const error = new Error(
        "Only one active global coupon is allowed. Please deactivate the existing one first."
      );
      error.statusCode = 400;
      throw error;
    }

    couponData.course_id = null;
    couponData.is_global = true;
  }

  return await couponRepository.create(couponData);
};

export const updateCoupon = async (couponData, userId, role) => {
  const coupon = await couponRepository.findById(couponData.coupon_id);

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  if (!coupon.is_global) {
    const course = await courseRepository.findById(coupon.course_id);

    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }

    if (role !== "admin" && userId !== course.instructor_id) {
      const error = new Error("You are not authorized to update this coupon");
      error.statusCode = 403;
      throw error;
    }
  } else if (role !== "admin") {
    const error = new Error("You are not authorized to update this coupon");
    error.statusCode = 403;
    throw error;
  }

  if (
    couponData.discount_start_date > couponData.discount_end_date ||
    couponData.discount_end_date < new Date() ||
    couponData.discount_end_date < couponData.discount_start_date
  ) {
    const error = new Error("Invalid date range");
    error.statusCode = 400;
    throw error;
  }

  if (couponData.max_count < couponData.used_count) {
    const error = new Error("Invalid max count");
    error.statusCode = 400;
    throw error;
  }

  return await couponRepository.updateById(couponData.coupon_id, {
    is_active: couponData.is_active ?? coupon.is_active,
    discount_end_date: new Date(couponData.discount_end_date),
    max_count: couponData.max_count || coupon.max_count,
  });
};

export const deleteCoupon = async (coupon_id, userId, role) => {
  const coupon = await couponRepository.findById(coupon_id);

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  if (!coupon.is_global) {
    const course = await courseRepository.findById(coupon.course_id);

    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }

    if (role !== "admin" && userId !== course.instructor_id) {
      const error = new Error("You are not authorized to delete this coupon");
      error.statusCode = 403;
      throw error;
    }
  } else if (role !== "admin") {
    const error = new Error("You are not authorized to delete this coupon");
    error.statusCode = 403;
    throw error;
  }

  await couponRepository.deleteById(coupon_id);
  return { message: "Coupon deleted successfully" };
};

export const validateCoupon = async (code, course_id) => {
  const coupon = await couponRepository.findActiveCoupon(code, course_id);

  if (!coupon) {
    const error = new Error("Invalid or expired coupon");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.max_count && coupon.max_count > 0 && coupon.used_count >= coupon.max_count) {
    const error = new Error("Coupon has reached its usage limit");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  if (now < coupon.discount_start_date || now > coupon.discount_end_date) {
    const error = new Error("Coupon is not valid at this time");
    error.statusCode = 400;
    throw error;
  }

  return coupon;
};

export const getCouponAnalytics = async (couponId = null) => {
  const filter = couponId ? { _id: couponId } : {};
  const coupons = await couponRepository.findAll(filter);

  const analytics = await Promise.all(
    coupons.map(async (coupon) => {
      const paymentFilter = {
        course_id: coupon.course_id,
        coupon_code: coupon.code,
        status: "completed",
      };

      const aggregation = await paymentRepository.aggregate([
        { $match: paymentFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalUsage: { $sum: 1 },
          },
        },
      ]);

      const totalRevenue = aggregation[0]?.totalRevenue || 0;
      const totalUsage = aggregation[0]?.totalUsage || 0;

      let discountGiven = 0;
      if (coupon.course_id) {
        const course = await courseRepository.findById(coupon.course_id);
        if (course) {
          discountGiven =
            coupon.discount_type === "percentage"
              ? (course.price * coupon.discount_value) / 100 * totalUsage
              : coupon.discount_value * totalUsage;
        }
      }

      const conversionRate =
        coupon.max_count > 0 ? ((totalUsage / coupon.max_count) * 100).toFixed(1) : 0;

      return {
        couponId: coupon._id.toString(),
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        isActive: coupon.is_active,
        usedCount: coupon.used_count,
        maxCount: coupon.max_count,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        discountGiven: parseFloat(discountGiven).toFixed(2),
        conversionRate: parseFloat(conversionRate),
        startDate: coupon.discount_start_date,
        endDate: coupon.discount_end_date,
      };
    })
  );

  return analytics;
};

export const searchCoupons = async (searchTerm, filters = {}) => {
  let coupons = await couponRepository.findAll();

  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    coupons = coupons.filter((c) => regex.test(c.code));
  }

  if (filters.status) {
    coupons = coupons.filter((c) => c.is_active === (filters.status === "active"));
  }

  if (filters.courseId) {
    coupons = coupons.filter((c) => c.course_id === filters.courseId);
  }

  return coupons;
};

export const deactivateExpiredCoupons = async () => {
  const now = new Date();

  const result = await couponRepository.updateManyByFilter(
    { is_active: true, discount_end_date: { $lt: now } },
    { is_active: false }
  );

  return { deactivatedCount: result.modifiedCount || 0 };
};

export const getActiveGlobalCoupon = async () => {
  const globalCoupon = await couponRepository.findActiveGlobalCoupon();

  if (!globalCoupon) {
    return null;
  }

  return {
    code: globalCoupon.code,
    discountType: globalCoupon.discount_type,
    discountValue: parseFloat(globalCoupon.discount_value),
    expiresAt: globalCoupon.discount_end_date,
  };
};

export default {
  getAllCouponsByAdmin,
  getAllCouponsByInstructor,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponAnalytics,
  searchCoupons,
  deactivateExpiredCoupons,
  getActiveGlobalCoupon,
};
