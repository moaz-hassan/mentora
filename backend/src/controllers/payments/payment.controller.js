

import * as paymentService from "../../services/payments/payment.service.js";
import * as stripeService from "../../services/payments/stripe.service.js";
import { json } from "express";


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

export const createStripeIntent = async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET) {
      const error = new Error('Stripe is not configured on this server');
      error.statusCode = 500;
      throw error;
    }

    const { course_id, amount, currency = 'USD', payment_method = 'stripe' } = req.body;

    // create a payment record with status pending
    const payment = await paymentService.createPayment({ course_id, amount, currency, payment_method }, req.user.id);

    // create Stripe PaymentIntent
    const intent = await stripeService.createPaymentIntent({ amount, currency, metadata: { paymentId: payment.id, userId: req.user.id } });

    res.status(201).json({
      success: true,
      message: 'Stripe payment intent created',
      data: { payment, client_secret: intent.client_secret }
    });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody || req.body;
    const event = stripeService.constructEvent(rawBody, sig);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const paymentId = intent.metadata?.paymentId;
        if (paymentId) {
          await paymentService.updatePayment(paymentId, { status: 'completed' });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const paymentId = intent.metadata?.paymentId;
        if (paymentId) {
          await paymentService.updatePayment(paymentId, { status: 'failed' });
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
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
