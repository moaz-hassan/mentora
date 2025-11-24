import models from "../models/index.model.js";
const { Coupon, Course } = models;

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

export const createCoupon = async (couponData, instructorId) => {
  const course = await Course.findByPk(couponData.course_id);

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error(
      "You are not authorized to create a coupon for this course"
    );
    error.statusCode = 403;
    throw error;
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
    where: { code, course_id, is_active: true },
  });

  if (!coupon) {
    const error = new Error("Invalid or expired coupon");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.max_count === 0 || coupon.used_count >= coupon.max_count) {
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
