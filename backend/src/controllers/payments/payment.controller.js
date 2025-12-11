

import * as paymentService from "../../services/payments/payment.service.js";


export const getAllPayments = async (req, res, next) => {
  try {
    const filters = {
      user_id: req.query.user_id,
      course_id: req.query.course_id,
      status: req.query.status,
    };
    
    const payments = await paymentService.getAllPayments(filters);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};


export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};


export const createPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};


export const updatePayment = async (req, res, next) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};


export const deletePayment = async (req, res, next) => {
  try {
    const result = await paymentService.deletePayment(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
