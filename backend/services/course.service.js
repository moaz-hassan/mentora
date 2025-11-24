import models from "../models/index.model.js";

const { Course, User, Profile, Lesson, Enrollment, Chapter, Quiz } = models;

export const getAllCourses = async (filters = {}) => {
  const where = {};

  if (filters.category) where.category = filters.category;
  if (filters.level) where.level = filters.level;
  if (filters.instructor_id) where.instructor_id = filters.instructor_id;

  const courses = await Course.findAll({
    where,
    include: [
      { model: User, attributes: ["id", "first_name", "last_name", "email"] },
      {
        model: Chapter,
        order: [["order_number", "ASC"]],
        include: [{ model: Lesson, order: [["order_number", "ASC"]] }],
      },
    ],
  });

  return courses;
};

export const getCourseById = async (courseId) => {
  const course = await Course.findByPk(courseId, {
    attributes: [
      "id",
      "title",
      "description",
      "category",
      "level",
      "price",
      "thumbnail_url",
      "status",
      "intro_video_url",
      "intro_video_public_id",
      "intro_video_hls_url",
      "intro_video_duration",
    ],
    include: [
      {
        model: Chapter,
        order: [["order_number", "ASC"]],
        include: [
          {
            model: Lesson,
            order: [["order_number", "ASC"]],
          },
          {
            model: Quiz,
            order: [["order_number", "ASC"]],
            attributes: ["id", "title", "order_number", "questions"],
          },
        ],
      },
    ],
  });

  if (!course || course.status !== "approved") {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  // Filter lesson and quiz data for security
  // Only show full data for preview lessons, otherwise show only title and type
  const filteredCourse = course.toJSON();
  
  console.log(filteredCourse);
  if (filteredCourse.Chapters) {
    filteredCourse.Chapters = filteredCourse.Chapters.map(chapter => {
      // Filter lessons
      if (chapter.Lessons) {
        chapter.Lessons = chapter.Lessons.map(lesson => {
          if (lesson.is_preview) {
            // For preview lessons, include video_url, hls_url, video_public_id, and content
            return {
              id: lesson.id,
              title: lesson.title,
              lesson_type: lesson.lesson_type,
              video_url: lesson.video_url,
              video_public_id: lesson.video_public_id,
              hls_url: lesson.hls_url,
              content: lesson.content,
              duration: lesson.duration,
              order_number: lesson.order_number,
              is_preview: lesson.is_preview,
            };
          } else {
            // For non-preview lessons, only include metadata (no video_url, hls_url, or content)
            return {
              id: lesson.id,
              title: lesson.title,
              lesson_type: lesson.lesson_type,
              duration: lesson.duration,
              order_number: lesson.order_number,
              is_preview: lesson.is_preview,
            };
          }
        });
      }

      // Filter quizzes - only show id, title, and order_number (exclude questions)
      if (chapter.Quizzes) {
        chapter.Quizzes = chapter.Quizzes.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          order_number: quiz.order_number,
          questions_length: quiz.questions.length,
          // questions field intentionally excluded for security
        }));
      }

      return chapter;
    });
  }

  return filteredCourse;
};

export const createCourse = async (courseData, thumbnailFile, instructorId) => {
  let thumbnailUrl = null;
  let thumbnailPublicId = null;

  // Step 1: Upload thumbnail to Cloudinary if provided
  if (thumbnailFile) {
    try {
      const { uploadToCloudinary } = await import(
        "../utils/cloudinary.util.js"
      );
      const uploadResult = await uploadToCloudinary(
        thumbnailFile.buffer,
        "courses/thumbnails",
        "image"
      );
      thumbnailUrl = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    } catch (error) {
      const uploadError = new Error(
        `Failed to upload thumbnail: ${error.message}`
      );
      uploadError.statusCode = 500;
      throw uploadError;
    }
  }

  // Step 2: Create course record with thumbnail URL
  const course = await Course.create({
    ...courseData,
    instructor_id: instructorId,
    thumbnail_url: thumbnailUrl,
    thumbnail_public_id: thumbnailPublicId,
  });

  // Step 3: Automatically create a group chat room for the course
  try {
    const { autoCreateGroupChat } = await import("./chat.service.js");
    await autoCreateGroupChat(course.id, instructorId);
    console.log(`Group chat room created for course: ${course.id}`);
  } catch (error) {
    // Log error but don't fail course creation if chat room creation fails
    console.error("Failed to create group chat room:", error);
  }

  return course;
};

export const updateCourse = async (courseId, updateData, instructorId) => {
  const course = await Course.findByPk(courseId);

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

  // Check if course can be edited (not pending review)
  if (course.status === "pending_review") {
    const error = new Error("Cannot edit course while it is pending review");
    error.statusCode = 400;
    throw error;
  }

  if (updateData.have_discount === true) {
    if (
      !updateData.discount_type ||
      !updateData.discount_value ||
      !updateData.discount_start_date ||
      !updateData.discount_end_date
    ) {
      const error = new Error(
        "Discount type, discount value, discount start date, and discount end date are required"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (updateData.have_discount === false) {
    updateData.discount_type = null;
    updateData.discount_value = null;
    updateData.discount_start_date = null;
    updateData.discount_end_date = null;
  }

  await course.update(updateData);

  return course;
};

export const updateCourseIntroVideo = async (
  courseId,
  videoData,
  instructorId
) => {
  const course = await Course.findByPk(courseId);

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

  // Validate video data
  if (!videoData.intro_video_url || !videoData.intro_video_public_id) {
    const error = new Error("Video URL and public ID are required");
    error.statusCode = 400;
    throw error;
  }

  // Validate Cloudinary URL
  const { validateCloudinaryUrl } = await import(
    "../controllers/cloudinary.controller.js"
  );
  const isValid = validateCloudinaryUrl(
    videoData.intro_video_url,
    videoData.intro_video_public_id
  );

  if (!isValid) {
    const error = new Error("Invalid video URL or public ID");
    error.statusCode = 400;
    throw error;
  }

  // Delete old intro video from Cloudinary if exists
  if (course.intro_video_public_id) {
    try {
      const { deleteFromCloudinary } = await import(
        "../utils/cloudinary.util.js"
      );
      await deleteFromCloudinary(course.intro_video_public_id, "video");
    } catch (error) {
      console.error("Failed to delete old intro video:", error);
      // Continue even if deletion fails
    }
  }

  // Update course with new intro video
  await course.update({
    intro_video_url: videoData.intro_video_url,
    intro_video_public_id: videoData.intro_video_public_id,
    intro_video_hls_url: videoData.intro_video_hls_url || null,
    intro_video_duration: videoData.intro_video_duration || 0,
  });

  return course;
};

export const deleteCourse = async (courseId, userId, userRole) => {
  const course = await Course.findByPk(courseId, {
    include: [{ model: Enrollment }],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.Enrollments.length > 0) {
    const error = new Error("Delete failed! Course has enrollments");
    error.statusCode = 400;
    throw error;
  }

  // Check if user is the instructor or admin
  if (course.instructor_id !== userId && userRole !== "admin") {
    const error = new Error("Not authorized to delete this course");
    error.statusCode = 403;
    throw error;
  }

  await course.destroy();

  return { message: "Course deleted successfully" };
};


export const saveDraft = async (courseId, instructorId) => {
  const course = await Course.findByPk(courseId);

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

  // Update course status to draft
  await course.update({
    status: "draft",
    is_published: false,
  });

  return course;
};

export const submitForReview = async (courseId, instructorId) => {
  const course = await Course.findByPk(courseId);

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

  // Validate course has required content
  const chapters = await Chapter.count({ where: { course_id: courseId } });
  if (chapters === 0) {
    const error = new Error(
      "Cannot submit for review: Course must have at least one chapter"
    );
    error.statusCode = 400;
    throw error;
  }

  // Update course status to pending review
  await course.update({
    status: "pending_review",
    submitted_for_review_at: new Date(),
    is_published: false,
  });

  // Create notifications for all admins
  const admins = await User.findAll({ where: { role: "admin" } });
  const { Notification } = models;

  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    type: "info",
    title: "New Course Pending Review",
    message: `Instructor ${instructorId} has submitted course "${course.title}" for review`,
    related_id: course.id,
    related_type: "course",
    is_read: false,
  }));

  await Notification.bulkCreate(notifications);

  return course;
};

export const canEditCourse = async (courseId, instructorId) => {
  const course = await Course.findByPk(courseId);

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    return { canEdit: false, reason: "Not authorized" };
  }

  // Cannot edit if pending review
  if (course.status === "pending_review") {
    return {
      canEdit: false,
      reason: "Course is pending review and cannot be edited",
    };
  }

  return { canEdit: true };
};

export const approveCourse = async (courseId, adminId) => {
  const course = await Course.findByPk(courseId);

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

  // Update course status to approved and publish
  await course.update({
    status: "approved",
    is_published: true,
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: null,
  });

  // Notify instructor
  const { Notification } = models;
  await Notification.create({
    user_id: course.instructor_id,
    type: "course_approved",
    title: "Course Approved",
    message: `Your course "${course.title}" has been approved and is now published`,
    related_id: course.id,
    related_type: "course",
    is_read: false,
  });

  return course;
};

export const rejectCourse = async (courseId, adminId, rejectionReason) => {
  const course = await Course.findByPk(courseId);

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

  // Validate rejection reason
  if (!rejectionReason || rejectionReason.trim().length < 10) {
    const error = new Error(
      "Rejection reason must be at least 10 characters long"
    );
    error.statusCode = 400;
    throw error;
  }

  // Update course status to rejected
  await course.update({
    status: "rejected",
    is_published: false,
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: rejectionReason,
  });

  // Notify instructor
  const { Notification } = models;
  await Notification.create({
    user_id: course.instructor_id,
    type: "course_rejected",
    title: "Course Rejected",
    message: `Your course "${course.title}" has been rejected. Reason: ${rejectionReason}`,
    related_id: course.id,
    related_type: "course",
    is_read: false,
  });

  return course;
};

export const getPendingCourses = async () => {
  const courses = await Course.findAll({
    where: { status: "pending_review" },
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email"],
        include: [{ model: Profile }],
      },
      {
        model: Chapter,
        include: [{ model: Lesson }],
      },
    ],
    order: [["submitted_for_review_at", "ASC"]],
  });

  return courses;
};

export const getCoursePreview = async (courseId) => {
  const { CourseReview, Sequelize } = models;

  // Get course with all related data
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email", "role"],
        include: [
          {
            model: Profile,
            attributes: ["bio", "profile_picture_url", "headline"],
          },
        ],
      },
      {
        model: Chapter,
        where: { status: "approved" }, // Only show approved chapters
        required: false,
        order: [["order_number", "ASC"]],
        include: [
          {
            model: Lesson,
            attributes: [
              "id",
              "title",
              "lesson_type",
              "duration",
              "order_number",
              "is_preview",
              "video_url", // Only for preview lessons
            ],
            order: [["order_number", "ASC"]],
          },
        ],
      },
      {
        model: CourseReview,
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: 10, // Show latest 10 reviews
      },
    ],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  // Only show published courses in preview
  if (!course.is_published) {
    const error = new Error("Course is not available for preview");
    error.statusCode = 403;
    throw error;
  }

  // Calculate enrollment count
  const enrollmentCount = await Enrollment.count({
    where: { course_id: courseId },
  });

  // Calculate average rating
  const ratingStats = await CourseReview.findOne({
    where: { course_id: courseId },
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("rating")), "averageRating"],
      [Sequelize.fn("COUNT", Sequelize.col("id")), "reviewCount"],
    ],
    raw: true,
  });

  // Filter preview lessons (max 3)
  const previewLessons = [];
  if (course.Chapters) {
    for (const chapter of course.Chapters) {
      if (chapter.Lessons) {
        for (const lesson of chapter.Lessons) {
          if (lesson.is_preview && previewLessons.length < 3) {
            previewLessons.push({
              id: lesson.id,
              title: lesson.title,
              lesson_type: lesson.lesson_type,
              duration: lesson.duration,
              video_url: lesson.video_url,
              chapter_title: chapter.title,
            });
          }
        }
      }
    }
  }

  // Build curriculum structure without lesson details (except preview)
  const curriculum = course.Chapters
    ? course.Chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        order_number: chapter.order_number,
        lesson_count: chapter.Lessons ? chapter.Lessons.length : 0,
        lessons: chapter.Lessons
          ? chapter.Lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              lesson_type: lesson.lesson_type,
              duration: lesson.duration,
              is_preview: lesson.is_preview,
              // Don't include video_url or content for non-preview lessons
            }))
          : [],
      }))
    : [];

  // Calculate active discount
  let activeDiscount = null;
  if (course.have_discount) {
    const now = new Date();
    const startDate = course.discount_start_date
      ? new Date(course.discount_start_date)
      : null;
    const endDate = course.discount_end_date
      ? new Date(course.discount_end_date)
      : null;

    if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
      let discountedPrice = course.price;
      if (course.discount_type === "percentage") {
        discountedPrice =
          course.price - (course.price * course.discount_value) / 100;
      } else if (course.discount_type === "fixed") {
        discountedPrice = course.price - course.discount_value;
      }
      discountedPrice = Math.max(0, discountedPrice); // Ensure non-negative

      activeDiscount = {
        type: course.discount_type,
        value: course.discount_value,
        original_price: parseFloat(course.price),
        discounted_price: parseFloat(discountedPrice.toFixed(2)),
        end_date: endDate,
      };
    }
  }

  // Build preview response
  const preview = {
    id: course.id,
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
    instructor: {
      id: course.User.id,
      name: `${course.User.first_name} ${course.User.last_name}`,
      email: course.User.email,
      bio: course.User.Profile ? course.User.Profile.bio : null,
      profile_picture_url: course.User.Profile
        ? course.User.Profile.profile_picture_url
        : null,
      headline: course.User.Profile ? course.User.Profile.headline : null,
    },
    stats: {
      enrollment_count: enrollmentCount,
      average_rating: ratingStats.averageRating
        ? parseFloat(ratingStats.averageRating).toFixed(1)
        : null,
      review_count: parseInt(ratingStats.reviewCount) || 0,
    },
    pricing: {
      price: parseFloat(course.price),
      has_discount: course.have_discount && activeDiscount !== null,
      discount: activeDiscount,
    },
    curriculum: curriculum,
    preview_lessons: previewLessons,
    reviews: course.CourseReviews
      ? course.CourseReviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          review_text: review.review_text,
          reviewer_name: `${review.User.first_name} ${review.User.last_name}`,
          created_at: review.created_at,
        }))
      : [],
  };

  return preview;
};

export const getPublicCurriculum = async (courseId) => {
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: Chapter,
        where: { status: "approved" },
        required: false,
        order: [["order_number", "ASC"]],
        include: [
          {
            model: Lesson,
            attributes: [
              "id",
              "title",
              "lesson_type",
              "duration",
              "order_number",
              "is_preview",
            ],
            order: [["order_number", "ASC"]],
          },
        ],
      },
    ],
  });

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

  const curriculum = course.Chapters
    ? course.Chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        order_number: chapter.order_number,
        lesson_count: chapter.Lessons ? chapter.Lessons.length : 0,
        total_duration: chapter.Lessons
          ? chapter.Lessons.reduce(
              (sum, lesson) => sum + (lesson.duration || 0),
              0
            )
          : 0,
        lessons: chapter.Lessons
          ? chapter.Lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              lesson_type: lesson.lesson_type,
              duration: lesson.duration,
              is_preview: lesson.is_preview,
            }))
          : [],
      }))
    : [];

  return {
    course_id: course.id,
    course_title: course.title,
    curriculum: curriculum,
  };
};

export const searchCourses = async (filters = {}) => {
  const {
    search,
    category,
    level,
    minPrice,
    maxPrice,
    sortBy = "relevance",
    page = 1,
    limit = 12,
  } = filters;

  const where = { is_published: true, status: "approved" };
  const offset = (page - 1) * limit;

  // Text search across title, description, and instructor name
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { subtitle: { [Op.like]: `%${search}%` } },
    ];
  }

  // Category filter
  if (category) {
    where.category = category;
  }

  // Level filter
  if (level) {
    where.level = level;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price[Op.gte] = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price[Op.lte] = maxPrice;
    }
  }

  // Determine sort order
  let order = [];
  switch (sortBy) {
    case "popularity":
      // Sort by enrollment count (requires subquery or join)
      order = [[models.Sequelize.literal("enrollment_count"), "DESC"]];
      break;
    case "rating":
      order = [[models.Sequelize.literal("average_rating"), "DESC"]];
      break;
    case "price_low_high":
      order = [["price", "ASC"]];
      break;
    case "price_high_low":
      order = [["price", "DESC"]];
      break;
    case "newest":
      order = [["createdAt", "DESC"]];
      break;
    case "relevance":
    default:
      // For relevance, prioritize exact title matches
      if (search) {
        order = [
          [models.Sequelize.literal("title LIKE '%" + search + "%'"), "DESC"],
        ];
      } else {
        order = [["createdAt", "DESC"]];
      }
      break;
  }

  // Get courses with enrollment count and rating
  const courses = await Course.findAndCountAll({
    where,
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email"],
      },
      {
        model: Enrollment,
        attributes: [],
        required: false,
      },
      {
        model: models.CourseReview,
        attributes: [],
        required: false,
      },
    ],
    attributes: {
      include: [
        [
          models.Sequelize.fn(
            "COUNT",
            models.Sequelize.fn(
              "DISTINCT",
              models.Sequelize.col("Enrollments.id")
            )
          ),
          "enrollment_count",
        ],
        [
          models.Sequelize.fn(
            "AVG",
            models.Sequelize.col("CourseReviews.rating")
          ),
          "average_rating",
        ],
      ],
    },
    group: ["Course.id", "User.id"],
    order,
    limit: parseInt(limit),
    offset: parseInt(offset),
    subQuery: false,
  });

  // Format results
  const formattedCourses = courses.rows.map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    category: course.category,
    level: course.level,
    price: parseFloat(course.price),
    thumbnail_url: course.thumbnail_url,
    badge: course.badge,
    instructor: {
      id: course.User.id,
      name: `${course.User.first_name} ${course.User.last_name}`,
    },
    enrollment_count: parseInt(course.dataValues.enrollment_count) || 0,
    average_rating: course.dataValues.average_rating
      ? parseFloat(course.dataValues.average_rating).toFixed(1)
      : null,
  }));

  return {
    courses: formattedCourses,
    pagination: {
      total: courses.count.length,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(courses.count.length / limit),
    },
  };
};

export const getAllCategories = async () => {
  const categories = await Course.findAll({
    where: { is_published: true, status: "approved" },
    attributes: [
      [
        models.Sequelize.fn("DISTINCT", models.Sequelize.col("category")),
        "category",
      ],
    ],
    raw: true,
  });

  return categories.map((c) => c.category).filter((c) => c !== null);
};

export const getFeaturedCourses = async (limit = 6) => {
  const courses = await Course.findAll({
    where: {
      is_published: true,
      status: "approved",
      badge: { [Op.ne]: null }, // Courses with badges are featured
    },
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name"],
      },
    ],
    limit: parseInt(limit),
    order: [["createdAt", "DESC"]],
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    price: parseFloat(course.price),
    thumbnail_url: course.thumbnail_url,
    badge: course.badge,
    instructor: {
      id: course.User.id,
      name: `${course.User.first_name} ${course.User.last_name}`,
    },
  }));
};

export const getPopularCourses = async (limit = 6) => {
  const courses = await Course.findAll({
    where: { is_published: true, status: "approved" },
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name"],
      },
      {
        model: Enrollment,
        attributes: [],
        required: false,
      },
    ],
    attributes: {
      include: [
        [
          models.Sequelize.fn("COUNT", models.Sequelize.col("Enrollments.id")),
          "enrollment_count",
        ],
      ],
    },
    group: ["Course.id", "User.id"],
    order: [[models.Sequelize.literal("enrollment_count"), "DESC"]],
    limit: parseInt(limit),
    subQuery: false,
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    price: parseFloat(course.price),
    thumbnail_url: course.thumbnail_url,
    badge: course.badge,
    instructor: {
      id: course.User.id,
      name: `${course.User.first_name} ${course.User.last_name}`,
    },
    enrollment_count: parseInt(course.dataValues.enrollment_count) || 0,
  }));
};
