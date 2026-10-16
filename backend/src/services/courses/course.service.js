import courseRepository from "../../repositories/courses/course.repository.js";
import chapterRepository from "../../repositories/courses/chapter.repository.js";
import lessonRepository from "../../repositories/courses/lesson.repository.js";
import notificationRepository from "../../repositories/communication/notification.repository.js";
import ratingRepository from "../../repositories/courses/rating.repository.js";
import Course from "../../models/courses/course.model.js";
import Chapter from "../../models/courses/chapter.model.js";
import Lesson from "../../models/courses/lesson.model.js";
import Enrollment from "../../models/courses/enrollment.model.js";
import Ratings from "../../models/courses/Ratings.model.js";
import User from "../../models/auth/user.model.js";

export const getAllCourses = async (filters = {}) => {
  const filter = {};
  if (filters.category) filter.category = filters.category;
  if (filters.level) filter.level = filters.level;
  if (filters.instructor_id) filter.instructor_id = filters.instructor_id;

  return await courseRepository.find(filter);
};

export const getAllFeaturedCourses = async () => {
  const courses = await Course.find({ is_featured: true, status: "approved" })
    .populate("Instructor", "id first_name last_name")
    .exec();

  return await Promise.all(
    courses.map(async (course) => {
      const enrollmentCount = await Enrollment.countDocuments({ course_id: course._id.toString() });
      const courseData = course.toJSON();
      courseData.enrollments_count = enrollmentCount;
      return courseData;
    })
  );
};

export const getCourseById = async (courseId, options = {}) => {
  const { includeNonApproved = false } = options;
  const course = await courseRepository.findById(courseId);

  if (!course || (!includeNonApproved && course.status !== "approved")) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const [enrollmentsCount, ratingStats] = await Promise.all([
    Enrollment.countDocuments({ course_id: courseId }),
    ratingRepository.getAverageRatingForCourse(courseId),
  ]);

  const { formatCourseResponse } = await import("../../utils/formatters/course.formatter.js");
  return formatCourseResponse(course.toJSON(), enrollmentsCount, ratingStats, {
    includeFullContent: includeNonApproved,
  });
};

export const createCourse = async (courseData, thumbnailFile, instructorId) => {
  let thumbnailUrl = null, thumbnailPublicId = null;
  if (thumbnailFile) {
    try {
      const { uploadToCloudinary } = await import("../../utils/cloudinary.util.js");
      const uploadResult = await uploadToCloudinary(thumbnailFile.buffer, "courses/thumbnails", "image");
      thumbnailUrl = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    } catch (error) {
      const uploadError = new Error(`Failed to upload thumbnail: ${error.message}`);
      uploadError.statusCode = 500;
      throw uploadError;
    }
  }

  const course = await courseRepository.create({
    ...courseData,
    instructor_id: instructorId,
    thumbnail_url: thumbnailUrl,
    thumbnail_public_id: thumbnailPublicId,
  });

  try {
    const { autoCreateGroupChat } = await import("../communication/chat.service.js");
    await autoCreateGroupChat(course._id.toString(), instructorId);
  } catch (error) {
    console.error("Failed to create group chat room:", error);
  }

  return course;
};

export const updateCourse = async (courseId, updateData, instructorId) => {
  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (course.instructor_id !== instructorId) {
    const error = new Error("Not authorized to update this course");
    error.statusCode = 403;
    throw error;
  }
  if (course.status === "pending_review") {
    const error = new Error("Cannot edit course while it is pending review");
    error.statusCode = 400;
    throw error;
  }
  if (
    updateData.have_discount === true &&
    (!updateData.discount_type || !updateData.discount_value || !updateData.discount_start_date || !updateData.discount_end_date)
  ) {
    const error = new Error("Discount type, discount value, discount start date, and discount end date are required");
    error.statusCode = 400;
    throw error;
  }
  if (updateData.have_discount === false) {
    updateData.discount_type = null;
    updateData.discount_value = null;
    updateData.discount_start_date = null;
    updateData.discount_end_date = null;
  }

  return await courseRepository.updateById(courseId, updateData);
};

export const updateCourseIntroVideo = async (courseId, videoData, instructorId) => {
  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (course.instructor_id !== instructorId) {
    const error = new Error("Not authorized to update this course");
    error.statusCode = 403;
    throw error;
  }
  if (!videoData.intro_video_url || !videoData.intro_video_public_id) {
    const error = new Error("Video URL and public ID are required");
    error.statusCode = 400;
    throw error;
  }
  const { validateCloudinaryUrl } = await import("../../controllers/media/cloudinary.controller.js");
  if (!validateCloudinaryUrl(videoData.intro_video_url, videoData.intro_video_public_id)) {
    const error = new Error("Invalid video URL or public ID");
    error.statusCode = 400;
    throw error;
  }
  if (course.intro_video_public_id) {
    try {
      const { deleteFromCloudinary } = await import("../../utils/cloudinary.util.js");
      await deleteFromCloudinary(course.intro_video_public_id, "video");
    } catch (error) {
      console.error("Failed to delete old intro video:", error);
    }
  }

  return await courseRepository.updateById(courseId, {
    intro_video_url: videoData.intro_video_url,
    intro_video_public_id: videoData.intro_video_public_id,
    intro_video_hls_url: videoData.intro_video_hls_url || null,
    intro_video_duration: videoData.intro_video_duration || 0,
  });
};

export const deleteCourse = async (courseId, userId, userRole) => {
  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollmentCount = await Enrollment.countDocuments({ course_id: courseId });
  if (enrollmentCount > 0) {
    const error = new Error("Delete failed! Course has enrollments");
    error.statusCode = 400;
    throw error;
  }

  if (course.instructor_id !== userId && userRole !== "admin") {
    const error = new Error("Not authorized to delete this course");
    error.statusCode = 403;
    throw error;
  }

  try {
    const { deleteCourseChat } = await import("../communication/chat.service.js");
    await deleteCourseChat(courseId);
  } catch (error) {
    console.error("Failed to delete course chat room:", error);
  }

  await courseRepository.deleteById(courseId);
  return { message: "Course deleted successfully" };
};

export const saveDraft = async (courseId, instructorId) => {
  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (course.instructor_id !== instructorId) {
    const error = new Error("Not authorized to update this course");
    error.statusCode = 403;
    throw error;
  }
  return await courseRepository.updateById(courseId, { status: "draft", is_published: false });
};

export const submitForReview = async (courseId, instructorId) => {
  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (course.instructor_id !== instructorId) {
    const error = new Error("Not authorized to update this course");
    error.statusCode = 403;
    throw error;
  }

  const chapterCount = await Chapter.countDocuments({ course_id: courseId });
  if (chapterCount === 0) {
    const error = new Error("Cannot submit for review: Course must have at least one chapter");
    error.statusCode = 400;
    throw error;
  }

  await courseRepository.updateById(courseId, {
    status: "pending_review",
    submitted_for_review_at: new Date(),
    is_published: false,
  });

  const admins = await User.find({ role: "admin" }).exec();
  const notifications = admins.map((admin) => ({
    user_id: admin._id.toString(),
    type: "info",
    title: "New Course Pending Review",
    message: `Instructor ${instructorId} has submitted course "${course.title}" for review`,
    related_id: courseId,
    related_type: "course",
    is_read: false,
  }));

  if (notifications.length > 0) {
    await notificationRepository.insertMany(notifications);
  }

  return await Course.findById(courseId).exec();
};

export const approveCourse = async (courseId, adminId) => {
  const course = await Course.findById(courseId)
    .populate("Instructor", "id first_name last_name email")
    .exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (course.status !== "pending_review") {
    const error = new Error("Course is not pending review");
    error.statusCode = 400;
    throw error;
  }

  await courseRepository.updateById(courseId, {
    status: "approved",
    is_published: true,
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: null,
  });

  await notificationRepository.create({
    user_id: course.instructor_id,
    type: "course_approved",
    title: "Course Approved",
    message: `Your course "${course.title}" has been approved and is now published`,
    related_id: courseId,
    related_type: "course",
    is_read: false,
  });

  try {
    const { sendCourseApprovedEmail } = await import("../auth/email.service.js");
    await sendCourseApprovedEmail({
      instructorEmail: course.Instructor?.email,
      instructorName: `${course.Instructor?.first_name} ${course.Instructor?.last_name}`,
      courseTitle: course.title,
    });
  } catch (emailError) {
    console.error("Failed to send course approved email:", emailError);
  }

  return await Course.findById(courseId).exec();
};

export const rejectCourse = async (courseId, adminId, rejectionReason) => {
  const course = await Course.findById(courseId)
    .populate("Instructor", "id first_name last_name email")
    .exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (course.status !== "pending_review") {
    const error = new Error("Course is not pending review");
    error.statusCode = 400;
    throw error;
  }
  if (!rejectionReason || rejectionReason.trim().length < 10) {
    const error = new Error("Rejection reason must be at least 10 characters long");
    error.statusCode = 400;
    throw error;
  }

  await courseRepository.updateById(courseId, {
    status: "rejected",
    is_published: false,
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: rejectionReason,
  });

  await notificationRepository.create({
    user_id: course.instructor_id,
    type: "course_rejected",
    title: "Course Rejected",
    message: `Your course "${course.title}" has been rejected. Reason: ${rejectionReason}`,
    related_id: courseId,
    related_type: "course",
    is_read: false,
  });

  try {
    const { sendCourseRejectedEmail } = await import("../auth/email.service.js");
    await sendCourseRejectedEmail({
      instructorEmail: course.Instructor?.email,
      instructorName: `${course.Instructor?.first_name} ${course.Instructor?.last_name}`,
      courseTitle: course.title,
      courseId,
      rejectionReason,
    });
  } catch (emailError) {
    console.error("Failed to send course rejected email:", emailError);
  }

  return await Course.findById(courseId).exec();
};

export const getPendingCourses = async () => {
  const courses = await Course.find({ status: "pending_review" })
    .sort({ submitted_for_review_at: 1 })
    .exec();

  return await Promise.all(
    courses.map(async (course) => {
      const instructor = await User.findById(course.instructor_id)
        .select("id first_name last_name email profile")
        .exec();
      const chapters = await chapterRepository.findByCourseId(course._id.toString());
      const courseData = course.toJSON();
      courseData.Instructor = instructor;
      courseData.Chapters = chapters;
      return courseData;
    })
  );
};

export const getCoursePreview = async (courseId) => {
  const course = await Course.findById(courseId).exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (!course.is_published) {
    const error = new Error("Course is not available for preview");
    error.statusCode = 403;
    throw error;
  }

  const instructor = await User.findById(course.instructor_id)
    .select("id first_name last_name email role profile")
    .exec();

  const chapters = await Chapter.find({ course_id: courseId, status: "approved" })
    .sort({ order_number: 1 })
    .exec();

  const chaptersWithLessons = await Promise.all(
    chapters.map(async (ch) => {
      const lessons = await Lesson.find({ chapter_id: ch._id.toString() })
        .select("id title lesson_type duration order_number is_preview video_url")
        .sort({ order_number: 1 })
        .exec();
      return { ...ch.toJSON(), Lessons: lessons };
    })
  );

  const reviews = await Ratings.find({ course_id: courseId })
    .sort({ createdAt: -1 })
    .limit(10)
    .exec();

  const [enrollmentCount, ratingStats] = await Promise.all([
    Enrollment.countDocuments({ course_id: courseId }),
    ratingRepository.getAverageRatingForCourse(courseId),
  ]);

  const previewLessons = [];
  for (const chapter of chaptersWithLessons) {
    for (const lesson of chapter.Lessons || []) {
      if (lesson.is_preview && previewLessons.length < 3) {
        previewLessons.push({
          id: lesson._id?.toString(),
          title: lesson.title,
          lesson_type: lesson.lesson_type,
          duration: lesson.duration,
          video_url: lesson.video_url,
          chapter_title: chapter.title,
        });
      }
    }
  }

  const curriculum = chaptersWithLessons.map((chapter) => ({
    id: chapter._id?.toString(),
    title: chapter.title,
    description: chapter.description,
    order_number: chapter.order_number,
    lesson_count: chapter.Lessons ? chapter.Lessons.length : 0,
    lessons: (chapter.Lessons || []).map((lesson) => ({
      id: lesson._id?.toString(),
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      duration: lesson.duration,
      is_preview: lesson.is_preview,
    })),
  }));

  let activeDiscount = null;
  if (course.have_discount) {
    const now = new Date();
    const startDate = course.discount_start_date ? new Date(course.discount_start_date) : null;
    const endDate = course.discount_end_date ? new Date(course.discount_end_date) : null;
    if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
      let discountedPrice = course.price;
      if (course.discount_type === "percentage") {
        discountedPrice = course.price - (course.price * course.discount_value) / 100;
      } else if (course.discount_type === "fixed") {
        discountedPrice = course.price - course.discount_value;
      }
      discountedPrice = Math.max(0, discountedPrice);
      activeDiscount = {
        type: course.discount_type,
        value: course.discount_value,
        original_price: parseFloat(course.price),
        discounted_price: parseFloat(discountedPrice.toFixed(2)),
        end_date: endDate,
      };
    }
  }

  return {
    id: course._id.toString(),
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    learning_objectives: course.learning_objectives,
    requirements: course.requirements,
    target_audience: course.target_audience,
    category: course.category,
    level: course.level,
    price: parseFloat(course.price),
    thumbnail_url: course.thumbnail_url,
    intro_video_url: course.intro_video_url,
    intro_video_hls_url: course.intro_video_hls_url,
    intro_video_duration: course.intro_video_duration,
    badge: course.badge,
    last_updated: course.updatedAt,
    instructor: instructor
      ? {
          id: instructor._id.toString(),
          name: `${instructor.first_name} ${instructor.last_name}`,
          email: instructor.email,
          bio: instructor.profile?.bio || null,
          avatar_url: instructor.profile?.avatar_url || null,
          headline: instructor.profile?.headline || null,
        }
      : null,
    stats: {
      enrollment_count: enrollmentCount,
      average_rating: ratingStats?.averageRating ? parseFloat(ratingStats.averageRating).toFixed(1) : null,
      review_count: ratingStats?.totalReviews || 0,
    },
    pricing: {
      price: parseFloat(course.price),
      has_discount: course.have_discount && activeDiscount !== null,
      discount: activeDiscount,
    },
    curriculum,
    preview_lessons: previewLessons,
    reviews: reviews.map((review) => ({
      id: review._id.toString(),
      rating: review.rating,
      review_text: review.review,
      createdAt: review.createdAt,
    })),
  };
};

export const getPublicCurriculum = async (courseId) => {
  const course = await Course.findById(courseId).select("id title is_published").exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  if (!course.is_published) {
    const error = new Error("Course is not published");
    error.statusCode = 403;
    throw error;
  }

  const chapters = await Chapter.find({ course_id: courseId, status: "approved" })
    .sort({ order_number: 1 })
    .exec();

  const curriculum = await Promise.all(
    chapters.map(async (ch) => {
      const lessons = await Lesson.find({ chapter_id: ch._id.toString() })
        .select("id title lesson_type duration order_number is_preview")
        .sort({ order_number: 1 })
        .exec();
      return {
        id: ch._id.toString(),
        title: ch.title,
        description: ch.description,
        order_number: ch.order_number,
        lesson_count: lessons.length,
        total_duration: lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
        lessons: lessons.map((lesson) => ({
          id: lesson._id.toString(),
          title: lesson.title,
          lesson_type: lesson.lesson_type,
          duration: lesson.duration,
          is_preview: lesson.is_preview,
        })),
      };
    })
  );

  return { course_id: course._id.toString(), course_title: course.title, curriculum };
};

export const searchCourses = async (filters = {}) => {
  const {
    search,
    category,
    subcategory,
    level,
    minPrice,
    maxPrice,
    priceType,
    rating,
    sortBy = "relevance",
    page = 1,
    limit = 12,
  } = filters;

  const filter = { status: "approved" };
  const offset = (parseInt(page) - 1) * parseInt(limit);

  if (search && search.trim()) {
    const searchTerm = search.trim();
    const regex = new RegExp(searchTerm, "i");
    filter.$or = [
      { title: regex },
      { subtitle: regex },
      { description: regex },
    ];
  }

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (level) filter.level = level;

  if (priceType === "free") {
    filter.price = 0;
  } else if (priceType === "paid") {
    filter.price = { $gt: 0 };
  } else if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
  }

  let sort = {};
  switch (sortBy) {
    case "price_low_high":
      sort = { price: 1 };
      break;
    case "price_high_low":
      sort = { price: -1 };
      break;
    case "newest":
      sort = { createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
      break;
  }

  const [courses, totalCount] = await Promise.all([
    Course.find(filter)
      .populate("Instructor", "id first_name last_name email")
      .sort(sort)
      .skip(offset)
      .limit(parseInt(limit))
      .exec(),
    Course.countDocuments(filter),
  ]);

  // Attach enrollment counts and ratings
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const courseId = course._id.toString();
      const [enrollmentCount, ratingStats] = await Promise.all([
        Enrollment.countDocuments({ course_id: courseId }),
        ratingRepository.getAverageRatingForCourse(courseId),
      ]);

      const avgRating = ratingStats?.averageRating ? parseFloat(ratingStats.averageRating) : null;

      if (rating && rating > 0 && (!avgRating || avgRating < parseFloat(rating))) {
        return null;
      }

      return {
        id: courseId,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description ? course.description.substring(0, 200) + "..." : "",
        category: course.category,
        subcategory: course.subcategory,
        level: course.level,
        price: parseFloat(course.price),
        thumbnail_url: course.thumbnail_url,
        badge: course.badge,
        have_discount: course.have_discount,
        discount_type: course.discount_type,
        discount_value: course.discount_value ? parseFloat(course.discount_value) : null,
        instructor: {
          id: course.Instructor?._id?.toString(),
          name: course.Instructor ? `${course.Instructor.first_name} ${course.Instructor.last_name}` : "Unknown",
        },
        enrollment_count: enrollmentCount,
        average_rating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        review_count: ratingStats?.totalReviews || 0,
        created_at: course.createdAt,
      };
    })
  );

  const filteredCourses = coursesWithStats.filter(Boolean);

  return {
    courses: filteredCourses,
    page: parseInt(page),
    perPage: parseInt(limit),
    totalPages: Math.ceil(totalCount / parseInt(limit)),
    totalCount,
  };
};

export const getAllCategories = async () => {
  const categories = await Course.distinct("category", {
    is_published: true,
    status: "approved",
  });
  return categories.filter((c) => c !== null && c !== "");
};

export const getFeaturedCourses = async (limit = 6) => {
  const courses = await Course.find({
    is_published: true,
    status: "approved",
    badge: { $ne: null },
  })
    .populate("Instructor", "id first_name last_name")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .exec();

  return courses.map((course) => ({
    id: course._id.toString(),
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    price: parseFloat(course.price),
    thumbnail_url: course.thumbnail_url,
    badge: course.badge,
    instructor: {
      id: course.Instructor?._id?.toString(),
      name: course.Instructor ? `${course.Instructor.first_name} ${course.Instructor.last_name}` : "Unknown",
    },
  }));
};

export const getPopularCourses = async (limit = 6) => {
  const topCourses = await Enrollment.aggregate([
    { $group: { _id: "$course_id", enrollment_count: { $sum: 1 } } },
    { $sort: { enrollment_count: -1 } },
    { $limit: parseInt(limit) },
  ]);

  const courseIds = topCourses.map((c) => c._id);
  const courses = await Course.find({
    _id: { $in: courseIds },
    is_published: true,
    status: "approved",
  })
    .populate("Instructor", "id first_name last_name")
    .exec();

  return courses.map((course) => {
    const stats = topCourses.find((c) => c._id === course._id.toString());
    return {
      id: course._id.toString(),
      title: course.title,
      subtitle: course.subtitle,
      category: course.category,
      level: course.level,
      price: parseFloat(course.price),
      thumbnail_url: course.thumbnail_url,
      badge: course.badge,
      instructor: {
        id: course.Instructor?._id?.toString(),
        name: course.Instructor ? `${course.Instructor.first_name} ${course.Instructor.last_name}` : "Unknown",
      },
      enrollment_count: stats?.enrollment_count || 0,
    };
  });
};

export const saveCourseAnalysis = async (courseId, analysis) => {
  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  return await courseRepository.updateById(courseId, { ai_analysis: analysis });
};

export const toggleFeatured = async (courseId) => {
  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  return await courseRepository.updateById(courseId, { is_featured: !course.is_featured });
};

export default {
  getAllCourses,
  getAllFeaturedCourses,
  getCourseById,
  createCourse,
  updateCourse,
  updateCourseIntroVideo,
  deleteCourse,
  saveDraft,
  submitForReview,
  approveCourse,
  rejectCourse,
  getPendingCourses,
  getCoursePreview,
  getPublicCurriculum,
  searchCourses,
  getAllCategories,
  getFeaturedCourses,
  getPopularCourses,
  saveCourseAnalysis,
  toggleFeatured,
};
