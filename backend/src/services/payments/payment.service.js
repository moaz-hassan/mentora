import paymentRepository from "../../repositories/payments/payment.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";

export const getAllPayments = async (filters = {}) => {
  const filter = {};

  if (filters.user_id) filter.user_id = filters.user_id;
  if (filters.course_id) filter.course_id = filters.course_id;
  if (filters.status) filter.status = filters.status;

  return await paymentRepository.findAll(filter);
};

export const getPaymentById = async (paymentId) => {
  const payment = await paymentRepository.findById(paymentId);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  return payment;
};

export const createPayment = async (paymentData, userId) => {
  const { course_id, amount, currency, payment_method } = paymentData;

  const course = await courseRepository.findById(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  return await paymentRepository.create({
    user_id: userId,
    course_id,
    amount,
    currency: currency || "USD",
    payment_method: payment_method || "card",
    status: "pending",
  });
};

export const updatePayment = async (paymentId, updateData) => {
  const payment = await paymentRepository.findById(paymentId);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  return await paymentRepository.updateById(paymentId, updateData);
};

export const deletePayment = async (paymentId) => {
  const payment = await paymentRepository.findById(paymentId);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  await paymentRepository.deleteById(paymentId);

  return { message: "Payment deleted successfully" };
};

export default {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
