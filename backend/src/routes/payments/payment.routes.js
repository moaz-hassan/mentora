import express from "express";
import * as paymentController from "../../controllers/payments/payment.controller.js";
import { createPaymentValidator, updatePaymentValidator, paymentIdValidator, paymentQueryValidator } from "../../validators/payments/payment.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), paymentQueryValidator, validateResult, paymentController.getAllPayments);

router.get("/:id", authenticate, paymentIdValidator, validateResult, paymentController.getPaymentById);

router.post("/", authenticate, createPaymentValidator, validateResult, paymentController.createPayment);

// Stripe payment intent creation
router.post("/stripe-intent", authenticate, paymentController.createStripeIntent);

// Stripe webhook (uses raw body for signature verification)
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.handleStripeWebhook);

router.put("/:id", authenticate, authorize("admin"), updatePaymentValidator, validateResult, paymentController.updatePayment);

router.delete("/:id", authenticate, authorize("admin"), paymentIdValidator, validateResult, paymentController.deletePayment);

export default router;
