/**
 * Analytics Controller
 * Purpose: Handle analytics route handlers for instructors
 * Routes: /api/instructor/analytics
 */

import * as analyticsService from "../services/analytics.service.js";

/**
 * Get instructor dashboard overview
 * GET /api/instructor/analytics/overview
 */
export const getInstructorOverview = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const overview = await analyticsService.getInstructorOverview(instructorId);

    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course-specific analytics
 * GET /api/instructor/analytics/courses/:courseId
 */
export const getCourseAnalytics = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;

    const analytics = await analyticsService.getCourseAnalytics(
      courseId,
      instructorId
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics
 * GET /api/instructor/analytics/revenue
 */
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const { startDate, endDate } = req.query;

    const revenue = await analyticsService.getRevenueAnalytics(
      instructorId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get engagement metrics
 * GET /api/instructor/analytics/engagement
 */
export const getEngagementMetrics = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const engagement = await analyticsService.getEngagementMetrics(
      instructorId,
      days
    );

    res.status(200).json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export analytics data
 * GET /api/instructor/analytics/export
 */
export const exportAnalyticsData = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const { startDate, endDate } = req.query;

    const data = await analyticsService.exportAnalyticsData(
      instructorId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      message: "Analytics data exported",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrollment trend
 * GET /api/instructor/analytics/enrollments
 */
export const getEnrollmentTrend = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    const groupBy = req.query.groupBy || 'day'; // day, week, or month

    const trend = await analyticsService.getEnrollmentTrendWithGrouping(
      instructorId,
      days,
      groupBy
    );

    res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Generate comprehensive analytics report
 * POST /api/instructor/analytics/report
 */
export const generateReport = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const { startDate, endDate, courseIds, anonymizeStudents } = req.body;

    const report = await analyticsService.generateComprehensiveReport(
      instructorId,
      startDate,
      endDate,
      courseIds,
      anonymizeStudents !== false // Default to true
    );

    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
