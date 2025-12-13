import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";
import { sequelize } from "../../config/db.js";

const {
  Course,
  User,
  Profile,
  Lesson,
  Enrollment,
  Chapter,
  Quiz,
  Ratings,
  Category,
  SubCategory,
} = models;

export const getAllCourses = async (filters = {}) => {
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.level) where.level = filters.level;
  if (filters.instructor_id) where.instructor_id = filters.instructor_id;

  const courses = await Course.findAll({
    where,
    include: [
      {
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name", "email"],
      },
      {
        model: Chapter,
        order: [["order_number", "ASC"]],
        include: [{ model: Lesson, order: [["order_number", "ASC"]] }],
      },
    ],
  });
  return courses;
};

export const getAllFeaturedCourses = async () => {
  const courses = await Course.findAll({
    where: { is_featured: true, status: "approved" },
    attributes: [
      'id',
      'title',
      'subtitle',
      'description',
      'price',
      'thumbnail_url',
      'level',
      'category',
      'badge',
      'subcategory',
      'is_featured',
      'status',
      [literal("(SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = Course.id)"), "enrollments_count"]
    ],
    include: [
      {
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name"],
      },
      {
        model: Chapter,
        order: [["order_number", "ASC"]],
        include: [{ model: Lesson, order: [["order_number", "ASC"]] }],
      },
      {
        model: Category,
        attributes: ["name"],
      },
      {
        model: SubCategory,
        attributes: ["name"],
      },
      {
        model: Ratings,
        attributes: ["id", "rating", "course_id", "student_id"],
      },
    ],
  });
  return courses;
};

export const getCourseById = async (courseId, options = {}) => {
  const { includeNonApproved = false } = options;
  const course = await Course.findByPk(courseId, {
    attributes: [
      "id",
      "title",
      "description",
      "category",
      "subcategory",
      "level",
      "price",
      "thumbnail_url",
      "status",
      "intro_video_url",
      "intro_video_public_id",
      "intro_video_hls_url",
      "intro_video_duration",
      "have_discount",
      "discount_type",
      "discount_value",
      "discount_start_date",
      "discount_end_date",
      ["createdAt", "created_at"],
      ["updatedAt", "updated_at"],
    ],
    include: [
      {
        model: Chapter,
        include: [
          {
            model: Lesson,
            include: [
              {
                model: models.LessonMaterial,
                as: "materials",
                attributes: ["id", "filename", "file_type"],
              },
            ],
          },
          {
            model: Quiz,
            attributes: ["id", "title", "order_number", "questions"],
          },
        ],
      },
      {
        model: models.User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name"],
        include: [
          {
            model: models.Profile,
            as: "Profile",
            attributes: ["bio", "headline", "avatar_url"],
          },
        ],
      },
      {
        model: models.Category,
        attributes: ["id", "name"],
        required: false,
      },
      {
        model: models.SubCategory,
        attributes: ["id", "name"],
        required: false,
      },
    ],
    order: [
      [Chapter, "order_number", "ASC"],
      [Chapter, Lesson, "order_number", "ASC"],
      [Chapter, Quiz, "order_number", "ASC"],
    ],
  });

  if (!course || (!includeNonApproved && course.status !== "approved")) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollmentsCount = await models.Enrollment.count({
    where: { course_id: courseId },
  });

  const reviewStats = await Ratings.findOne({
    where: { course_id: courseId },
    attributes: [
      [fn("AVG", col("rating")), "averageRating"],
      [fn("COUNT", col("id")), "totalReviews"],
    ],
    raw: true,
  });

  const { formatCourseResponse } = await import("../../utils/formatters/course.formatter.js");
  // For admin preview, include full lesson/quiz content
  return formatCourseResponse(course.toJSON(), enrollmentsCount, reviewStats, { includeFullContent: includeNonApproved });
};

export const createCourse = async (courseData, thumbnailFile, instructorId) => {
  let thumbnailUrl = null,
    thumbnailPublicId = null;
  if (thumbnailFile) {
    try {
      const { uploadToCloudinary } = await import(
        "../../utils/cloudinary.util.js"
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
  const course = await Course.create({
    ...courseData,
    instructor_id: instructorId,
    thumbnail_url: thumbnailUrl,
    thumbnail_public_id: thumbnailPublicId,
  });
  try {
    const { autoCreateGroupChat } = await import(
      "../communication/chat.service.js"
    );
    await autoCreateGroupChat(course.id, instructorId);
  } catch (error) {
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
  if (course.status === "pending_review") {
    const error = new Error("Cannot edit course while it is pending review");
    error.statusCode = 400;
    throw error;
  }
  if (
    updateData.have_discount === true &&
    (!updateData.discount_type ||
      !updateData.discount_value ||
      !updateData.discount_start_date ||
      !updateData.discount_end_date)
  ) {
    const error = new Error(
      "Discount type, discount value, discount start date, and discount end date are required"
    );
    error.statusCode = 400;
    throw error;
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
  if (!videoData.intro_video_url || !videoData.intro_video_public_id) {
    const error = new Error("Video URL and public ID are required");
    error.statusCode = 400;
    throw error;
  }
  const { validateCloudinaryUrl } = await import(
    "../../controllers/media/cloudinary.controller.js"
  );
  if (
    !validateCloudinaryUrl(
      videoData.intro_video_url,
      videoData.intro_video_public_id
    )
  ) {
    const error = new Error("Invalid video URL or public ID");
    error.statusCode = 400;
    throw error;
  }
  if (course.intro_video_public_id) {
    try {
      const { deleteFromCloudinary } = await import(
        "../../utils/cloudinary.util.js"
      );
      await deleteFromCloudinary(course.intro_video_public_id, "video");
    } catch (error) {
      console.error("Failed to delete old intro video:", error);
    }
  }
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
  if (course.instructor_id !== userId && userRole !== "admin") {
    const error = new Error("Not authorized to delete this course");
    error.statusCode = 403;
    throw error;
  }

  // Delete associated chat room if exists
  try {
    const { deleteCourseChat } = await import("../communication/chat.service.js");
    await deleteCourseChat(courseId);
  } catch (error) {
    console.error("Failed to delete course chat room:", error);
    // Continue with course deletion even if chat deletion fails
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
  await course.update({ status: "draft", is_published: false });
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
  const chapters = await Chapter.count({ where: { course_id: courseId } });
  if (chapters === 0) {
    const error = new Error(
      "Cannot submit for review: Course must have at least one chapter"
    );
    error.statusCode = 400;
    throw error;
  }
  await course.update({
    status: "pending_review",
    submitted_for_review_at: new Date(),
    is_published: false,
  });
  const admins = await User.findAll({ where: { role: "admin" } });
  const { Notification } = models;
  await Notification.bulkCreate(
    admins.map((admin) => ({
      user_id: admin.id,
      type: "info",
      title: "New Course Pending Review",
      message: `Instructor ${instructorId} has submitted course "${course.title}" for review`,
      related_id: course.id,
      related_type: "course",
      is_read: false,
    }))
  );
  return course;
};

export const approveCourse = async (courseId, adminId) => {
  const course = await Course.findByPk(courseId, {
    include: [{
      model: User,
      as: "Instructor",
      attributes: ["id", "first_name", "last_name", "email"],
    }],
  });
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
  await course.update({
    status: "approved",
    is_published: true,
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: null,
  });
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

  // Send email notification
  try {
    const { sendCourseApprovedEmail } = await import("../auth/email.service.js");
    await sendCourseApprovedEmail({
      instructorEmail: course.Instructor.email,
      instructorName: `${course.Instructor.first_name} ${course.Instructor.last_name}`,
      courseTitle: course.title,
    });
  } catch (emailError) {
    console.error("Failed to send course approved email:", emailError);
  }

  return course;
};

export const rejectCourse = async (courseId, adminId, rejectionReason) => {
  const course = await Course.findByPk(courseId, {
    include: [{
      model: User,
      as: "Instructor",
      attributes: ["id", "first_name", "last_name", "email"],
    }],
  });
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
    const error = new Error(
      "Rejection reason must be at least 10 characters long"
    );
    error.statusCode = 400;
    throw error;
  }
  await course.update({
    status: "rejected",
    is_published: false,
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: rejectionReason,
  });
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

  // Send email notification
  try {
    const { sendCourseRejectedEmail } = await import("../auth/email.service.js");
    await sendCourseRejectedEmail({
      instructorEmail: course.Instructor.email,
      instructorName: `${course.Instructor.first_name} ${course.Instructor.last_name}`,
      courseTitle: course.title,
      courseId: course.id,
      rejectionReason: rejectionReason,
    });
  } catch (emailError) {
    console.error("Failed to send course rejected email:", emailError);
  }

  return course;
};

export const getPendingCourses = async () => {
  return await Course.findAll({
    where: { status: "pending_review" },
    include: [
      {
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name", "email"],
        include: [{ model: Profile }],
      },
      { model: Chapter, include: [{ model: Lesson }] },
    ],
    order: [["submitted_for_review_at", "ASC"]],
  });
};

export const getCoursePreview = async (courseId) => {
  const { CourseReview } = models;
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name", "email", "role"],
        include: [
          { model: Profile, attributes: ["bio", "avatar_url", "headline"] },
        ],
      },
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
              "video_url",
            ],
            order: [["order_number", "ASC"]],
          },
        ],
      },
      {
        model: CourseReview,
        include: [
          { model: User, attributes: ["id", "first_name", "last_name"] },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      },
    ],
  });
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
  const enrollmentCount = await Enrollment.count({
    where: { course_id: courseId },
  });
  const ratingStats = await CourseReview.findOne({
    where: { course_id: courseId },
    attributes: [
      [fn("AVG", col("rating")), "averageRating"],
      [fn("COUNT", col("id")), "reviewCount"],
    ],
    raw: true,
  });
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
            }))
          : [],
      }))
    : [];
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
      avatar_url: course.User.Profile ? course.User.Profile.avatar_url : null,
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
    curriculum,
    preview_lessons: previewLessons,
    reviews: course.CourseReviews
      ? course.CourseReviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          review_text: review.review_text,
          reviewer_name: `${review.User.first_name} ${review.User.last_name}`,
          createdAt: review.createdAt,
        }))
      : [],
  };
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
  return { course_id: course.id, course_title: course.title, curriculum };
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



  const where = { status: "approved" };
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let courseIds = null;
  let relevanceScores = new Map();

  if (search && search.trim()) {
    const searchTerm = search.trim();
    const isShortQuery = searchTerm.length < 3;
    
    if (!isShortQuery) {
      try {
        const results = await sequelize.query(`
          SELECT id, 
                 MATCH(title, description) AGAINST(:query IN NATURAL LANGUAGE MODE) as relevance
          FROM courses
          WHERE MATCH(title, description) AGAINST(:query IN NATURAL LANGUAGE MODE)
            AND status = 'approved'
          ORDER BY relevance DESC
          LIMIT 500
        `, {
          replacements: { query: searchTerm },
          type: sequelize.QueryTypes.SELECT,
        });

        if (results && results.length > 0) {
          courseIds = results.map(r => r.id);
          results.forEach(r => relevanceScores.set(r.id, parseFloat(r.relevance) || 0));
          console.log(`[SearchCourses] Step 1 FULLTEXT NATURAL found ${courseIds.length} results`);
        }
      } catch (err) {
        console.warn('[SearchCourses] Step 1 failed:', err.message);
      }
    }

    if ((!courseIds || courseIds.length === 0) && !isShortQuery) {
      try {
        const booleanQuery = searchTerm
          .split(/\s+/)
          .filter(w => w.length >= 2)
          .map(word => `+${word}*`)
          .join(' ');

        if (booleanQuery) {
          const results = await sequelize.query(`
            SELECT id,
                   MATCH(title, description) AGAINST(:query IN BOOLEAN MODE) as relevance
            FROM courses
            WHERE MATCH(title, description) AGAINST(:query IN BOOLEAN MODE)
              AND status = 'approved'
            ORDER BY relevance DESC
            LIMIT 500
          `, {
            replacements: { query: booleanQuery },
            type: sequelize.QueryTypes.SELECT,
          });

          if (results && results.length > 0) {
            courseIds = results.map(r => r.id);
            results.forEach(r => relevanceScores.set(r.id, parseFloat(r.relevance) || 0));
            console.log(`[SearchCourses] Step 2 FULLTEXT BOOLEAN found ${courseIds.length} results`);
          }
        }
      } catch (err) {
        console.warn('[SearchCourses] Step 2 failed:', err.message);
      }
    }

    if (!courseIds || courseIds.length === 0) {
      try {
        const likePattern = `%${searchTerm}%`;
        const results = await sequelize.query(`
          SELECT id,
                 CASE 
                   WHEN title LIKE :pattern THEN 100
                   WHEN subtitle LIKE :pattern THEN 50
                   WHEN description LIKE :pattern THEN 10
                   ELSE 0
                 END as relevance
          FROM courses
          WHERE (title LIKE :pattern OR subtitle LIKE :pattern OR description LIKE :pattern)
            AND status = 'approved'
          ORDER BY relevance DESC, createdAt DESC
          LIMIT 500
        `, {
          replacements: { pattern: likePattern },
          type: sequelize.QueryTypes.SELECT,
        });

        if (results && results.length > 0) {
          courseIds = results.map(r => r.id);
          results.forEach(r => relevanceScores.set(r.id, parseFloat(r.relevance) || 0));
          console.log(`[SearchCourses] Step 3 LIKE found ${courseIds.length} results`);
        }
      } catch (err) {
        console.warn('[SearchCourses] Step 3 failed:', err.message);
      }
    }

    if (!courseIds || courseIds.length === 0) {
      return {
        courses: [],
        page: parseInt(page),
        perPage: parseInt(limit),
        totalPages: 0,
        totalCount: 0,
      };
    }

    where.id = { [Op.in]: courseIds };
  }


  if (category) {
    where.category = category;
  }
  
  if (subcategory) {
    where.subcategory = subcategory;
  }
  
  if (level) {
    where.level = level;
  }


  if (priceType === 'free') {
    where.price = { [Op.eq]: 0 };
  } else if (priceType === 'paid') {
    where.price = { [Op.gt]: 0 };
  } else if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price[Op.gte] = parseFloat(minPrice);
    }
    if (maxPrice !== undefined) {
      where.price[Op.lte] = parseFloat(maxPrice);
    }
  }


  let order = [];
  const searchTerm = search ? search.trim() : '';
  
  switch (sortBy) {
    case "popularity":
      order = [[literal("enrollment_count"), "DESC"]];
      break;
    case "rating":
      order = [[literal("average_rating"), "DESC NULLS LAST"]];
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
      
      if (searchTerm) {
        order = [
          [literal(`CASE WHEN title LIKE '%${searchTerm}%' THEN 0 ELSE 1 END`), "ASC"],
          [literal("enrollment_count"), "DESC"],
        ];
      } else {
        order = [["createdAt", "DESC"]];
      }
      break;
  }


  const courses = await Course.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name", "email"],
      },
      {
        model: Category,
        attributes: ["id", "name"],
        required: false,
      },
      { model: Enrollment, attributes: [], required: false },
      { model: Ratings, attributes: [], required: false },
    ],
    attributes: {
      include: [
        [
          fn("COUNT", fn("DISTINCT", col("Enrollments.id"))),
          "enrollment_count",
        ],
        [fn("AVG", col("Ratings.rating")), "average_rating"],
        [fn("COUNT", fn("DISTINCT", col("Ratings.id"))), "review_count"],
      ],
    },
    group: ["Course.id", "Instructor.id", "Category.id"],
    order,
    limit: parseInt(limit),
    offset: parseInt(offset),
    subQuery: false,
  });

  let filteredRows = courses.rows;
  if (rating && rating > 0) {
    filteredRows = courses.rows.filter(course => {
      const avgRating = parseFloat(course.dataValues.average_rating) || 0;
      return avgRating >= parseFloat(rating);
    });
  }


  const formattedCourses = filteredRows.map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description ? course.description.substring(0, 200) + '...' : '',
    category: course.Category?.name || course.category,
    category_id: course.category,
    subcategory: course.subcategory,
    level: course.level,
    price: parseFloat(course.price),
    thumbnail_url: course.thumbnail_url,
    badge: course.badge,
    have_discount: course.have_discount,
    discount_type: course.discount_type,
    discount_value: course.discount_value ? parseFloat(course.discount_value) : null,
    instructor: {
      id: course.Instructor?.id,
      name: course.Instructor ? `${course.Instructor.first_name} ${course.Instructor.last_name}` : 'Unknown',
    },
    enrollment_count: parseInt(course.dataValues.enrollment_count) || 0,
    average_rating: course.dataValues.average_rating
      ? parseFloat(parseFloat(course.dataValues.average_rating).toFixed(1))
      : null,
    review_count: parseInt(course.dataValues.review_count) || 0,
    created_at: course.createdAt,
  }));

  const totalCount = rating ? filteredRows.length : (Array.isArray(courses.count) ? courses.count.length : courses.count);
  
  const result = {
    courses: formattedCourses,
    page: parseInt(page),
    perPage: parseInt(limit),
    totalPages: Math.ceil(totalCount / parseInt(limit)),
    totalCount: totalCount,
  };



  return result;
};

export const getAllCategories = async () => {
  const categories = await Course.findAll({
    where: { is_published: true, status: "approved" },
    attributes: [[fn("DISTINCT", col("category")), "category"]],
    raw: true,
  });
  return categories.map((c) => c.category).filter((c) => c !== null);
};

export const getFeaturedCourses = async (limit = 6) => {
  const courses = await Course.findAll({
    where: { is_published: true, status: "approved", badge: { [Op.ne]: null } },
    include: [
      {
        model: User,
        as: "Instructor",
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
        as: "Instructor",
        attributes: ["id", "first_name", "last_name"],
      },
      { model: Enrollment, attributes: [], required: false },
    ],
    attributes: {
      include: [[fn("COUNT", col("Enrollments.id")), "enrollment_count"]],
    },
    group: ["Course.id", "Instructor.id"],
    order: [[literal("enrollment_count"), "DESC"]],
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



export const saveCourseAnalysis = async (courseId, analysis) => {
  const course = await Course.findByPk(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  await course.update({ ai_analysis: analysis });
  return course;
};

export const toggleFeatured = async (courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }
  await course.update({ is_featured: !course.is_featured });
  return course;
};
