import * as analyticsService from "../../services/instructor/analytics.service.js";

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


export const getEnrollmentTrend = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    const groupBy = req.query.groupBy || 'day'; 

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



export const generateReport = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const { startDate, endDate, courseIds, anonymizeStudents } = req.body;

    const report = await analyticsService.generateComprehensiveReport(
      instructorId,
      startDate,
      endDate,
      courseIds,
      anonymizeStudents !== false 
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
