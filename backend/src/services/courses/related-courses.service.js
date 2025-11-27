import models from "../../models/index.js";
import { Op } from "sequelize";

const { Course, User } = models;

/**
 * Get related courses by category
 * @param {string} courseId - Current course ID
 * @param {number} limit - Maximum number of courses to return
 * @returns {Promise<Array>} Array of related courses
 */
export const getRelatedCourses = async (courseId, limit = 4) => {
  // Validate courseId
  if (!courseId) {
    return [];
  }

  // First, get the current course to find its category
  const currentCourse = await Course.findByPk(courseId, {
    attributes: ["id", "category"],
  });

  if (!currentCourse || !currentCourse.category) {
    // Return empty array if course not found or has no category
    return [];
  }

  // Find other approved courses in the same category
  const relatedCourses = await Course.findAll({
    where: {
      category: currentCourse.category,
      id: { [Op.ne]: courseId }, // Exclude current course
      status: "approved",
    },
    attributes: [
      "id",
      "title",
      "thumbnail_url",
      "price",
      "have_discount",
      "discount_type",
      "discount_value",
      "discount_start_date",
      "discount_end_date",
    ],
    include: [
      {
        model: models.User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name"],
      },
    ],
    limit: parseInt(limit),
    order: [["createdAt", "DESC"]],
  });

  // Calculate average rating and total reviews for each course
  const coursesWithStats = await Promise.all(
    relatedCourses.map(async (course) => {
      const courseData = course.toJSON();

      // Get rating stats
      const ratingStats = await models.CourseReview.findOne({
        where: { course_id: course.id },
        attributes: [
          [models.sequelize.fn("AVG", models.sequelize.col("rating")), "averageRating"],
          [models.sequelize.fn("COUNT", models.sequelize.col("id")), "totalReviews"],
        ],
        raw: true,
      });

      courseData.average_rating = ratingStats?.averageRating
        ? parseFloat(ratingStats.averageRating).toFixed(1)
        : null;
      courseData.total_reviews = parseInt(ratingStats?.totalReviews) || 0;

      return courseData;
    })
  );

  return coursesWithStats;
};
