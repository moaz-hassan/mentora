import { getInstructorStats as getInstructorStatsService } from "../../services/instructor/instructor-stats.service.js";

/**
 * Get instructor statistics
 * @route GET /api/instructor/:instructorId/stats
 */
export const getInstructorStats = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const stats = await getInstructorStatsService(instructorId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching instructor stats:", error);

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch instructor statistics",
    });
  }
};
