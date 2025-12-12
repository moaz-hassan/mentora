import models from "../../models/index.js";
import { Op, fn, col } from "sequelize";

const { Coupon, Course, Payment } = models;

export const getAllCouponsByAdmin = async () => {
  return await Coupon.findAll();
};

export const getAllCouponsByInstructor = async (instructorId) => {

  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["title"],
    include: [
      {
        model: Coupon,
        attributes: ["code", "discount_type", "discount_value", "discount_start_date", "discount_end_date", "max_count", "used_count"],
      },
    ],
  });

  return courses;
};

export const createCoupon = async (couponData, userId, userRole) => {
  
  if (couponData.course_id) {
    const course = await Course.findByPk(couponData.course_id);

    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }

    
    if (userRole !== "admin" && course.instructor_id !== userId) {
      const error = new Error(
        "You are not authorized to create a coupon for this course"
      );
      error.statusCode = 403;
      throw error;
    }
    couponData.is_global = false;
  } else {
    // Global coupon - admin only
    if (userRole !== "admin") {
      const error = new Error(
        "Only admins can create coupons applicable to all courses"
      );
      error.statusCode = 403;
      throw error;
    }
    
    // Check if there's already an active global coupon
    const existingGlobalCoupon = await Coupon.findOne({
      where: {
        is_global: true,
        is_active: true,
        discount_end_date: { [Op.gte]: new Date() }
      }
    });
    
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

  return await Coupon.create(couponData);
};

export const updateCoupon = async (couponData, userId, role) => {
  const coupon = await Coupon.findByPk(couponData.coupon_id);

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }
  const course = await Course.findByPk(coupon.course_id);
  
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

  coupon.is_active = couponData.is_active || coupon.is_active;
  coupon.discount_end_date = new Date(couponData.discount_end_date);
  coupon.max_count = couponData.max_count || coupon.max_count;
  
  return await coupon.save();
};

export const deleteCoupon = async (coupon_id, userId, role) => {
  const coupon = await Coupon.findByPk(coupon_id);
  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(coupon.course_id);

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

  return await coupon.destroy();
};

export const validateCoupon = async (code, course_id) => {
  
  const coupon = await Coupon.findOne({
    where: {
      code,
      is_active: true,
      [Op.or]: [
        { course_id: course_id },  
        { course_id: null }         
      ]
    },
    order: [
      
      [fn('COALESCE', col('course_id'), 999999), 'ASC']
    ]
  });

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
  const { Op, Sequelize } = await import("sequelize");
  const { Payment } = models;
  
  const whereClause = couponId ? { id: couponId } : {};
  
  const coupons = await Coupon.findAll({
    where: whereClause,
    include: [{
      model: Course,
      attributes: ["title", "price"]
    }]
  });

  const analytics = await Promise.all(
    coupons.map(async (coupon) => {
      
      const payments = await Payment.findAll({
        where: {
          course_id: coupon.course_id,
          coupon_code: coupon.code,
          status: "completed"
        },
        attributes: [
          [fn("SUM", col("amount")), "totalRevenue"],
          [fn("COUNT", col("id")), "totalUsage"]
        ],
        raw: true
      });

      const totalRevenue = payments[0]?.totalRevenue || 0;
      const totalUsage = payments[0]?.totalUsage || 0;
      
      
      const course = await Course.findByPk(coupon.course_id);
      let discountGiven = 0;
      
      if (coupon.discount_type === "percentage") {
        discountGiven = (course.price * coupon.discount_value / 100) * totalUsage;
      } else {
        discountGiven = coupon.discount_value * totalUsage;
      }

      
      const conversionRate = coupon.max_count > 0 
        ? ((totalUsage / coupon.max_count) * 100).toFixed(1)
        : 0;

      return {
        couponId: coupon.id,
        code: coupon.code,
        courseTitle: coupon.Course?.title,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        isActive: coupon.is_active,
        usedCount: coupon.used_count,
        maxCount: coupon.max_count,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        discountGiven: parseFloat(discountGiven).toFixed(2),
        conversionRate: parseFloat(conversionRate),
        startDate: coupon.discount_start_date,
        endDate: coupon.discount_end_date
      };
    })
  );

  return analytics;
};


export const searchCoupons = async (searchTerm, filters = {}) => {
  const { Op } = await import("sequelize");
  
  const whereClause = {};
  
  if (searchTerm) {
    whereClause.code = {
      [Op.like]: `%${searchTerm}%`
    };
  }
  
  if (filters.status) {
    whereClause.is_active = filters.status === "active";
  }
  
  if (filters.courseId) {
    whereClause.course_id = filters.courseId;
  }

  const coupons = await Coupon.findAll({
    where: whereClause,
    include: [{
      model: Course,
      attributes: ["title", "instructor_id"]
    }],
    order: [["created_at", "DESC"]]
  });

  return coupons;
};


export const deactivateExpiredCoupons = async () => {
  const now = new Date();
  
  const result = await Coupon.update(
    { is_active: false },
    {
      where: {
        is_active: true,
        discount_end_date: {
          [Op.lt]: now
        }
      }
    }
  );

  return {
    deactivatedCount: result[0]
  };
};

// Get active global coupon for homepage marketing banner
export const getActiveGlobalCoupon = async () => {
  const now = new Date();
  
  const globalCoupon = await Coupon.findOne({
    where: {
      is_global: true,
      is_active: true,
      discount_start_date: { [Op.lte]: now },
      discount_end_date: { [Op.gte]: now }
    },
    attributes: [
      'id', 'code', 'discount_type', 'discount_value', 
      'discount_start_date', 'discount_end_date'
    ]
  });

  if (!globalCoupon) {
    return null;
  }

  return {
    code: globalCoupon.code,
    discountType: globalCoupon.discount_type,
    discountValue: parseFloat(globalCoupon.discount_value),
    expiresAt: globalCoupon.discount_end_date
  };
};
