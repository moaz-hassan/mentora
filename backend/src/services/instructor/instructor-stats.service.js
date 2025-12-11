import models from "../../models/index.js";
import { fn, col } from "sequelize";

const { Course, Enrollment, Ratings, User } = models;

export const getInstructorStats = async (instructorId) => {
  
  const instructor = await User.findByPk(instructorId);
  if (!instructor) {
    const error = new Error("Instructor not found");
    error.statusCode = 404;
    throw error;
  }

  
  const courses = await Course.findAll({
    where: {
      instructor_id: instructorId,
      status: "approved",
    },
    attributes: ["id"],
  });

  const courseIds = courses.map((course) => course.id);

  
  if (courseIds.length === 0) {
    return {
      totalStudents: 0,
      totalCourses: 0,
      averageRating: 0,
      totalReviews: 0,
    };
  }

  
  const totalStudents = await Enrollment.count({
    where: {
      course_id: courseIds,
    },
  });

  
  const totalCourses = courseIds.length;

  
  const reviewStats = await Ratings.findOne({
    where: {
      course_id: courseIds,
    },
    attributes: [
      [fn("AVG", col("rating")), "averageRating"],
      [fn("COUNT", col("id")), "totalReviews"],
    ],
    raw: true,
  });

  const averageRating = reviewStats.averageRating
    ? parseFloat(reviewStats.averageRating).toFixed(1)
    : 0;
  const totalReviews = parseInt(reviewStats.totalReviews) || 0;

  return {
    totalStudents,
    totalCourses,
    averageRating: parseFloat(averageRating),
    totalReviews,
  };
};
