
import express from "express";
import * as financialController from "../../controllers/admin/financial.controller.js";

const router = express.Router();


router.get("/overview", financialController.getFinancialOverview);


router.get("/revenue", financialController.getRevenueBreakdown);


router.get("/payouts", financialController.getInstructorPayouts);


router.get("/transactions", financialController.getTransactionHistory);


router.post("/export", financialController.exportFinancialData);

export default router;
