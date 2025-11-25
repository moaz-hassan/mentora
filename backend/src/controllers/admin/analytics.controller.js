/**
 * Admin Analytics Controller
 * Purpose: Handle platform analytics route handlers for admin
 */

import * as analyticsService from "../../services/admin/adminAnalytics.service.js";

/**
 * Get platform overview
 * GET /api/admin/analytics/overview
 */
export const getPlatformOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const overview = await analyticsService.getPlatformOverview({ startDate, endDate });

    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics
 * GET /api/admin/analytics/revenue
 */
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const revenue = await analyticsService.getRevenueAnalytics({ startDate, endDate });

    res.status(200).json({
      success: true,
      data: revenue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user growth analytics
 * GET /api/admin/analytics/users
 */
export const getUserGrowthAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userGrowth = await analyticsService.getUserGrowthAnalytics({ startDate, endDate });

    res.status(200).json({
      success: true,
      data: userGrowth
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrollment analytics
 * GET /api/admin/analytics/enrollments
 */
export const getEnrollmentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const enrollments = await analyticsService.getEnrollmentAnalytics({ startDate, endDate });

    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course performance analytics
 * GET /api/admin/analytics/courses
 */
export const getCoursePerformanceAnalytics = async (req, res, next) => {
  try {
    const coursePerformance = await analyticsService.getCoursePerformanceAnalytics();

    res.status(200).json({
      success: true,
      data: coursePerformance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export analytics data
 * POST /api/admin/analytics/export
 */
export const exportAnalyticsData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const data = await analyticsService.exportAnalyticsData({ startDate, endDate });

    res.status(200).json({
      success: true,
      message: "Analytics data exported successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};
