import * as analyticsService from "../../services/admin/adminAnalytics.service.js";

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
