/**
 * Platform Analytics Controller
 * Purpose: Handle HTTP requests for platform analytics
 */

import * as platformAnalyticsService from "../../services/admin/platformAnalytics.service.js";

/**
 * Get enrollment analytics
 * GET /api/admin/platform-analytics/enrollments
 */
export const getEnrollmentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, courseId, groupBy } = req.query;

    const analytics = await platformAnalyticsService.getEnrollmentAnalytics({
      startDate,
      endDate,
      courseId,
      groupBy
    });

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment analytics
 * GET /api/admin/platform-analytics/payments
 */
export const getPaymentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, status, groupBy } = req.query;

    const analytics = await platformAnalyticsService.getPaymentAnalytics({
      startDate,
      endDate,
      status,
      groupBy
    });

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user activity analytics
 * GET /api/admin/platform-analytics/users
 */
export const getUserActivityAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, role, groupBy } = req.query;

    const analytics = await platformAnalyticsService.getUserActivityAnalytics({
      startDate,
      endDate,
      role,
      groupBy
    });

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course performance analytics
 * GET /api/admin/platform-analytics/courses
 */
export const getCoursePerformanceAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, instructorId, limit } = req.query;

    const analytics = await platformAnalyticsService.getCoursePerformanceAnalytics({
      startDate,
      endDate,
      instructorId,
      limit: limit ? parseInt(limit) : undefined
    });

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate custom analytics report
 * POST /api/admin/platform-analytics/custom
 */
export const generateCustomReport = async (req, res, next) => {
  try {
    const reportConfig = req.body;

    const report = await platformAnalyticsService.generateCustomReport(reportConfig);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export analytics data
 * POST /api/admin/platform-analytics/export
 */
export const exportAnalytics = async (req, res, next) => {
  try {
    const { reportType, data } = req.body;

    if (!reportType || !data) {
      return res.status(400).json({
        success: false,
        message: "Report type and data are required"
      });
    }

    const csvData = await platformAnalyticsService.exportAnalyticsToCSV(reportType, data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${reportType}-analytics-${Date.now()}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule a report
 * POST /api/admin/platform-analytics/schedule
 */
export const scheduleReport = async (req, res, next) => {
  try {
    const scheduleConfig = req.body;
    const adminId = req.user.id;

    const result = await platformAnalyticsService.scheduleReport(scheduleConfig, adminId);

    res.status(200).json({
      success: true,
      message: "Report scheduled successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
