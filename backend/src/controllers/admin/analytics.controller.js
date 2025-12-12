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
    const { startDate, endDate, format = 'csv' } = req.body;
    
    // Gather all analytics data
    const [overview, revenue, users, enrollments, courses] = await Promise.all([
      analyticsService.getPlatformOverview({ startDate, endDate }),
      analyticsService.getRevenueAnalytics({ startDate, endDate }),
      analyticsService.getUserGrowthAnalytics({ startDate, endDate }),
      analyticsService.getEnrollmentAnalytics({ startDate, endDate }),
      analyticsService.getCoursePerformanceAnalytics()
    ]);

    const analyticsData = {
      overview,
      revenue: revenue.trend || revenue,
      users: users.trend || users,
      enrollments: enrollments.trend || enrollments,
      courses: courses.courses || courses
    };

    // Import export utilities dynamically
    const { generateAnalyticsPDF, generateAnalyticsCSV } = await import('../../utils/exportUtils.js');

    if (format === 'pdf') {
      const pdfBuffer = await generateAnalyticsPDF(analyticsData, 'Platform Analytics Report');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      return res.send(pdfBuffer);
    } else {
      const csvContent = generateAnalyticsCSV(analyticsData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csvContent);
    }
  } catch (error) {
    next(error);
  }
};
