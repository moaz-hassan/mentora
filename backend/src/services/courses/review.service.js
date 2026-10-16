import ratingRepository from "../../repositories/courses/rating.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";
import enrollmentRepository from "../../repositories/courses/enrollment.repository.js";
import User from "../../models/auth/user.model.js";

export const getAllReviews = async (studentId) => {
  return await ratingRepository.findByStudent(studentId);
};

export const createReview = async (reviewData, studentId) => {
  const { course_id, rating, review } = reviewData;

  const course = await courseRepository.findById(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, course_id);

  if (!enrollment) {
    const error = new Error("You are not enrolled in this course");
    error.statusCode = 403;
    throw error;
  }

  const existingReview = await ratingRepository.findByStudentAndCourse(studentId, course_id);

  if (existingReview) {
    const error = new Error("You have already reviewed this course");
    error.statusCode = 400;
    throw error;
  }

  return await ratingRepository.create({
    student_id: studentId,
    course_id,
    rating,
    review,
  });
};

export const updateReview = async (updateData, userId) => {
  const { review_id, rating, new_review } = updateData;

  const review = await ratingRepository.findById(review_id);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (review.student_id !== userId) {
    const error = new Error("Not authorized to update this review");
    error.statusCode = 403;
    throw error;
  }

  return await ratingRepository.updateById(review_id, {
    rating,
    review: new_review || review.review,
  });
};

export const deleteReview = async (reviewId, userId) => {
  const review = await ratingRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (review.student_id !== userId) {
    const error = new Error("Not authorized to delete this review");
    error.statusCode = 403;
    throw error;
  }

  await ratingRepository.deleteById(reviewId);

  return { message: "Review deleted successfully" };
};

export const getCourseReviews = async (courseId) => {
  const course = await courseRepository.findById(courseId);

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const reviews = await ratingRepository.findByCourse(courseId);

  // Attach user data to reviews
  const reviewsWithUser = await Promise.all(
    reviews.map(async (review) => {
      const user = await User.findById(review.student_id)
        .select("first_name last_name profile")
        .exec();

      const reviewObj = review.toJSON();
      reviewObj.User = user
        ? {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            Profile: { avatar_url: user.profile?.avatar_url || "" },
          }
        : null;

      return reviewObj;
    })
  );

  return reviewsWithUser;
};

export default {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getCourseReviews,
};
