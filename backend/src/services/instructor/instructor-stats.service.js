import Course from "../../models/courses/course.model.js";
import Enrollment from "../../models/courses/enrollment.model.js";
import Ratings from "../../models/courses/Ratings.model.js";

export const getInstructorStats = async (instructorId) => {
  const instructor = await import("../../models/auth/user.model.js").then((m) =>
    m.default.findById(instructorId).exec()
  );

  if (!instructor) {
    const error = new Error("Instructor not found");
    error.statusCode = 404;
    throw error;
  }

  const courses = await Course.find({
    instructor_id: instructorId,
    status: "approved",
  })
    .select("_id")
    .exec();

  const courseIds = courses.map((c) => c._id.toString());

  if (courseIds.length === 0) {
    return { totalStudents: 0, totalCourses: 0, averageRating: 0, totalReviews: 0 };
  }

  const totalStudents = await Enrollment.countDocuments({ course_id: { $in: courseIds } });

  const ratingAgg = await Ratings.aggregate([
    { $match: { course_id: { $in: courseIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = ratingAgg[0]?.averageRating
    ? parseFloat(ratingAgg[0].averageRating).toFixed(1)
    : 0;
  const totalReviews = ratingAgg[0]?.totalReviews || 0;

  return {
    totalStudents,
    totalCourses: courseIds.length,
    averageRating: parseFloat(averageRating),
    totalReviews,
  };
};

export default { getInstructorStats };
