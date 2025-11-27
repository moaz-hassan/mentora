import * as relatedCoursesService from "../../services/courses/related-courses.service.js";

/**
 * Get related courses by category
 * GET /api/courses/:courseId/related
 */
export const getRelatedCourses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const relatedCourses = await relatedCoursesService.getRelatedCourses(
      id,
      limit
    );

    res.status(200).json({
      success: true,
      count: relatedCourses.length,
      data: relatedCourses,
    });
  } catch (error) {
    next(error);
  }
};
