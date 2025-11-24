import models from "../models/index.model.js";

const { CourseReview, Course, User, Enrollment } = models;

export const getAllReviews = async (studentId) => {
  const reviews = await CourseReview.findAll({
    where: { student_id: studentId },
    include: [
      { model: User, attributes: ["id", "first_name", "last_name"] },
      { model: Course, attributes: ["id", "title"] },
    ],
    order: [["created_at", "DESC"]],
  });

  return reviews;
};

export const createReview = async (reviewData, studentId) => {
  const { course_id, rating, review } = reviewData;

  const course = await Course.findByPk(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await Enrollment.findOne({
    where: { student_id: studentId, course_id },
  });

  if (!enrollment) {
    const error = new Error("You are not enrolled in this course");
    error.statusCode = 403;
    throw error;
  }

  const existingReview = await CourseReview.findOne({
    where: { student_id: studentId, course_id },
  });

  if (existingReview) {
    const error = new Error("You have already reviewed this course");
    error.statusCode = 400;
    throw error;
  }

  const courseReview = await CourseReview.create({
    student_id: studentId,
    course_id,
    rating,
    review,
  });

  return courseReview;
};

export const updateReview = async (updateData, userId) => {
  const { review_id, rating, new_review } = updateData;

  const review = await CourseReview.findByPk(review_id);
  
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

  await review.update({ rating, review: new_review || review.review });

  return review;
};

export const deleteReview = async (reviewId, userId) => {
  const review = await CourseReview.findByPk(reviewId);

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

  await review.destroy();

  return { message: "Review deleted successfully" };
};
