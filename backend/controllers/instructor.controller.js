import {
  getAllCoursesService,
  getComprehensiveAnalytics,
  exportAnalyticsData,
} from "../services/instructor.service.js";

/**
 * Get all courses for instructor
 */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await getAllCoursesService(req.user.id);
    res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get comprehensive analytics for instructor
 * GET /api/instructor/analytics?courseId={optional}&days={optional}
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { courseId, days } = req.query;
    const instructorId = req.user.id;

    // Get analytics data
    const analytics = await getComprehensiveAnalytics(
      instructorId,
      courseId || null,
      days ? parseInt(days) : 30
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
 * Export analytics data
 * GET /api/instructor/analytics/export?courseId={optional}&days={optional}
 */
export const exportAnalytics = async (req, res, next) => {
  try {
    const { courseId, days } = req.query;
    const instructorId = req.user.id;

    // Get export data
    const exportData = await exportAnalyticsData(
      instructorId,
      courseId || null,
      days ? parseInt(days) : 30
    );

    res.status(200).json({
      success: true,
      message: "Analytics data exported successfully",
      data: exportData,
    });
  } catch (error) {
    next(error);
  }
};
