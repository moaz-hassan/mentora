import models from "../../models/index.js";
import { Op } from "sequelize";

const { Course, User } = models;


export const getRelatedCourses = async (courseId, limit = 4) => {
  
  if (!courseId) {
    return [];
  }

  
  const currentCourse = await Course.findByPk(courseId, {
    attributes: ["id", "category"],
  });

  if (!currentCourse || !currentCourse.category) {
    
    return [];
  }

  
  const relatedCourses = await Course.findAll({
    where: {
      category: currentCourse.category,
      id: { [Op.ne]: courseId }, 
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

  
  const coursesWithStats = await Promise.all(
    relatedCourses.map(async (course) => {
      const courseData = course.toJSON();

      
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
