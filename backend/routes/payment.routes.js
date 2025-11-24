/**
 * Payment Routes
 * Base path: /api/payments
 */

import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { createPaymentValidator, updatePaymentValidator, paymentIdValidator, paymentQueryValidator } from "../validators/payment.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/payments - Get all payments (admin only)
router.get("/", authenticate, authorize("admin"), paymentQueryValidator, validateResult, paymentController.getAllPayments);

// GET /api/payments/:id - Get payment by ID
router.get("/:id", authenticate, paymentIdValidator, validateResult, paymentController.getPaymentById);

// POST /api/payments - Create a new payment
router.post("/", authenticate, createPaymentValidator, validateResult, paymentController.createPayment);

// PUT /api/payments/:id - Update payment (admin only)
router.put("/:id", authenticate, authorize("admin"), updatePaymentValidator, validateResult, paymentController.updatePayment);

// DELETE /api/payments/:id - Delete payment (admin only)
router.delete("/:id", authenticate, authorize("admin"), paymentIdValidator, validateResult, paymentController.deletePayment);

export default router;
