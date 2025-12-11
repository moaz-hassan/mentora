import {
  getAllCoursesService,
  getComprehensiveAnalytics,
  exportAnalyticsData,
} from "../../services/instructor/instructor.service.js";


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


export const getAnalytics = async (req, res, next) => {
  try {
    const { courseId, days } = req.query;
    const instructorId = req.user.id;

    
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


export const exportAnalytics = async (req, res, next) => {
  try {
    const { courseId, days } = req.query;
    const instructorId = req.user.id;

    
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
