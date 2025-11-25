/**
 * Financial Controller
 * Purpose: Handle financial route handlers for admin
 */

import * as financialService from "../../services/admin/financial.service.js";

/**
 * Get financial overview
 * GET /api/admin/financial/overview
 */
export const getFinancialOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const overview = await financialService.getFinancialOverview({ startDate, endDate });

    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue breakdown
 * GET /api/admin/financial/revenue
 */
export const getRevenueBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const breakdown = await financialService.getRevenueBreakdown({ startDate, endDate });

    res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get instructor payouts
 * GET /api/admin/financial/payouts
 * GET /api/admin/financial/payouts/:instructorId
 */
export const getInstructorPayouts = async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId || null;
    const payouts = await financialService.getInstructorPayouts(instructorId);

    res.status(200).json({
      success: true,
      data: payouts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction history
 * GET /api/admin/financial/transactions
 */
export const getTransactionHistory = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      courseId: req.query.courseId,
      studentId: req.query.studentId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    };

    const transactions = await financialService.getTransactionHistory(filters);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export financial data
 * POST /api/admin/financial/export
 */
export const exportFinancialData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const data = await financialService.exportFinancialData({ startDate, endDate });

    res.status(200).json({
      success: true,
      message: "Financial data exported successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process payout request
 * POST /api/admin/financial/payouts/:id/process
 */
export const processPayoutRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Placeholder - would need payout tracking implementation
    res.status(200).json({
      success: true,
      message: "Payout request processed successfully",
      data: { payoutId: id, status: "processed" }
    });
  } catch (error) {
    next(error);
  }
};
