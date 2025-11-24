/**
 * Payment Service
 * Purpose: Handle payment-related business logic
 * Includes: CRUD operations for payments
 */

import models from "../models/index.model.js";

const { Payment, User, Course } = models;

/**
 * Get all payments with optional filters
 * @param {Object} filters - Query filters (user_id, course_id, status)
 * @returns {Array} List of payments
 */
export const getAllPayments = async (filters = {}) => {
  const where = {};

  if (filters.user_id) where.user_id = filters.user_id;
  if (filters.course_id) where.course_id = filters.course_id;
  if (filters.status) where.status = filters.status;

  const payments = await Payment.findAll({
    where,
    include: [
      { model: User, attributes: ["id", "full_name", "email"] },
      { model: Course, attributes: ["id", "title", "price"] },
    ],
    order: [["created_at", "DESC"]],
  });

  return payments;
};

/**
 * Get payment by ID
 * @param {string} paymentId - Payment ID
 * @returns {Object} Payment object
 */
export const getPaymentById = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId, {
    include: [
      { model: User, attributes: ["id", "full_name", "email"] },
      { model: Course, attributes: ["id", "title", "price"] },
    ],
  });

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  return payment;
};

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data
 * @param {string} userId - User ID making the payment
 * @returns {Object} Created payment
 */
export const createPayment = async (paymentData, userId) => {
  const { course_id, amount, currency, payment_method } = paymentData;

  // Verify course exists
  const course = await Course.findByPk(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const payment = await Payment.create({
    user_id: userId,
    course_id,
    amount,
    currency: currency || "USD",
    payment_method: payment_method || "card",
    status: "pending",
  });

  return payment;
};

/**
 * Update payment
 * @param {string} paymentId - Payment ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated payment
 */
export const updatePayment = async (paymentId, updateData) => {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  await payment.update(updateData);

  return payment;
};

/**
 * Delete payment
 * @param {string} paymentId - Payment ID
 * @returns {Object} Success message
 */
export const deletePayment = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  await payment.destroy();

  return { message: "Payment deleted successfully" };
};
