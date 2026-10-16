import Course from "../../models/courses/course.model.js";
import ratingRepository from "../../repositories/courses/rating.repository.js";

export const getRelatedCourses = async (courseId, limit = 4) => {
  if (!courseId) {
    return [];
  }

  const currentCourse = await Course.findById(courseId).select("category").exec();

  if (!currentCourse || !currentCourse.category) {
    return [];
  }

  const relatedCourses = await Course.find({
    category: currentCourse.category,
    _id: { $ne: courseId },
    status: "approved",
  })
    .select(
      "id title thumbnail_url price have_discount discount_type discount_value discount_start_date discount_end_date instructor_id"
    )
    .populate("Instructor", "id first_name last_name")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .exec();

  const coursesWithStats = await Promise.all(
    relatedCourses.map(async (course) => {
      const courseData = course.toJSON();

      const ratingStats = await ratingRepository.getAverageRatingForCourse(course._id.toString());

      courseData.average_rating = ratingStats?.averageRating
        ? parseFloat(ratingStats.averageRating).toFixed(1)
        : null;
      courseData.total_reviews = ratingStats?.totalReviews || 0;

      return courseData;
    })
  );

  return coursesWithStats;
};

export default { getRelatedCourses };
