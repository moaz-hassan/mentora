/**
 * Admin Financial Routes
 */
import express from "express";
import * as financialController from "../../controllers/admin/financial.controller.js";

const router = express.Router();

// Get financial overview
router.get("/overview", financialController.getFinancialOverview);

// Get revenue breakdown
router.get("/revenue", financialController.getRevenueBreakdown);

// Get instructor payouts
router.get("/payouts", financialController.getInstructorPayouts);

// Get transaction history
router.get("/transactions", financialController.getTransactionHistory);

// Export financial data
router.post("/export", financialController.exportFinancialData);

export default router;
