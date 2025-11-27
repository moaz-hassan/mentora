import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const { Course, User, Profile, Lesson, Enrollment, Chapter, Quiz } = models;

export const getAllCourses = async (filters = {}) => {
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.level) where.level = filters.level;
  if (filters.instructor_id) where.instructor_id = filters.instructor_id;

  const courses = await Course.findAll({
    where,
    include: [
      { model: User, as: "Instructor", attributes: ["id", "first_name", "last_name", "email"] },
      { model: Chapter, order: [["order_number", "ASC"]], include: [{ model: Lesson, order: [["order_number", "ASC"]] }] },
    ],
  });
  return courses;
};

export const getCourseById = async (courseId, options = {}) => {
  const { includeNonApproved = false } = options;
  const course = await Course.findByPk(courseId, {
    attributes: [
      "id", "title", "description", "category", "subcategory", "level", "price", "thumbnail_url", "status", 
      "intro_video_url", "intro_video_public_id", "intro_video_hls_url", "intro_video_duration", 
      "have_discount", "discount_type", "discount_value", "discount_start_date", "discount_end_date",
      ["createdAt", "created_at"], ["updatedAt", "updated_at"]
    ],
    include: [
      { 
        model: Chapter, 
        order: [["order_number", "ASC"]], 
        include: [
          { 
            model: Lesson, 
            order: [["order_number", "ASC"]],
            include: [
              { 
                model: models.LessonMaterial,
                as: "materials",
                attributes: ["id", "filename", "file_type"]
              }
            ]
          }, 
          { 
            model: Quiz, 
            order: [["order_number", "ASC"]], 
            attributes: ["id", "title", "order_number", "questions"] 
          }
        ] 
      },
      {
        model: models.User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name"],
        include: [
          {
            model: models.Profile,
            as: "Profile",
            attributes: ["bio", "headline", "avatar_url"]
          }
        ]
      },
      {
        model: models.Category,
        attributes: ["id", "name"],
        required: false
      },
      {
        model: models.SubCategory,
        attributes: ["id", "name"],
        required: false
      }
    ],
  });

  if (!course || (!includeNonApproved && course.status !== "approved")) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const filteredCourse = course.toJSON();
  
  // Calculate total downloadable resources
  let totalResources = 0;
  if (filteredCourse.Chapters) {
    filteredCourse.Chapters = filteredCourse.Chapters.map(chapter => {
      if (chapter.Lessons) {
        chapter.Lessons = chapter.Lessons.map(lesson => {
          // Count resources
          if (lesson.materials) {
            totalResources += lesson.materials.length;
          }
          
          if (lesson.is_preview) {
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
              LessonMaterials: lesson.materials 
            };
          }
          return { 
            id: lesson.id, 
            title: lesson.title, 
            lesson_type: lesson.lesson_type, 
            duration: lesson.duration, 
            order_number: lesson.order_number, 
            is_preview: lesson.is_preview,
            LessonMaterials: lesson.materials 
          };
        });
      }
      if (chapter.Quizzes) {
        chapter.Quizzes = chapter.Quizzes.map(quiz => ({ 
          id: quiz.id, 
          title: quiz.title, 
          order_number: quiz.order_number, 
          questions_length: quiz.questions.length 
        }));
      }
      return chapter;
    });
  }
  
  // Get enrollments count
  const enrollmentsCount = await models.Enrollment.count({
    where: { course_id: courseId }
  });
  
  // Get average rating and total reviews
  const { CourseReview } = models;
  const reviewStats = await CourseReview.findOne({
    where: { course_id: courseId },
    attributes: [
      [fn("AVG", col("rating")), "averageRating"],
      [fn("COUNT", col("id")), "totalReviews"],
    ],
    raw: true,
  });
  
  const averageRating = reviewStats.averageRating
    ? parseFloat(reviewStats.averageRating).toFixed(1)
    : null;
  const totalReviews = parseInt(reviewStats.totalReviews) || 0;
  
  filteredCourse.total_resources = totalResources;
  filteredCourse.enrollments_count = enrollmentsCount;
  filteredCourse.average_rating = averageRating ? parseFloat(averageRating) : null;
  filteredCourse.total_reviews = totalReviews;
  
  // Add category and subcategory names
  if (filteredCourse.Category) {
    filteredCourse.category_name = filteredCourse.Category.name;
    filteredCourse.category_id = filteredCourse.Category.id;
  }
  if (filteredCourse.SubCategory) {
    filteredCourse.subcategory_name = filteredCourse.SubCategory.name;
    filteredCourse.subcategory_id = filteredCourse.SubCategory.id;
  }
  
  return filteredCourse;
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
  const course = await Course.create({ ...courseData, instructor_id: instructorId, thumbnail_url: thumbnailUrl, thumbnail_public_id: thumbnailPublicId });
  try {
    const { autoCreateGroupChat } = await import("../communication/chat.service.js");
    await autoCreateGroupChat(course.id, instructorId);
  } catch (error) {
    console.error("Failed to create group chat room:", error);
  }
  return course;
};

export const updateCourse = async (courseId, updateData, instructorId) => {
  const course = await Course.findByPk(courseId);
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.instructor_id !== instructorId) { const error = new Error("Not authorized to update this course"); error.statusCode = 403; throw error; }
  if (course.status === "pending_review") { const error = new Error("Cannot edit course while it is pending review"); error.statusCode = 400; throw error; }
  if (updateData.have_discount === true && (!updateData.discount_type || !updateData.discount_value || !updateData.discount_start_date || !updateData.discount_end_date)) {
    const error = new Error("Discount type, discount value, discount start date, and discount end date are required"); error.statusCode = 400; throw error;
  }
  if (updateData.have_discount === false) { updateData.discount_type = null; updateData.discount_value = null; updateData.discount_start_date = null; updateData.discount_end_date = null; }
  await course.update(updateData);
  return course;
};

export const updateCourseIntroVideo = async (courseId, videoData, instructorId) => {
  const course = await Course.findByPk(courseId);
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.instructor_id !== instructorId) { const error = new Error("Not authorized to update this course"); error.statusCode = 403; throw error; }
  if (!videoData.intro_video_url || !videoData.intro_video_public_id) { const error = new Error("Video URL and public ID are required"); error.statusCode = 400; throw error; }
  const { validateCloudinaryUrl } = await import("../../controllers/media/cloudinary.controller.js");
  if (!validateCloudinaryUrl(videoData.intro_video_url, videoData.intro_video_public_id)) { const error = new Error("Invalid video URL or public ID"); error.statusCode = 400; throw error; }
  if (course.intro_video_public_id) {
    try { const { deleteFromCloudinary } = await import("../../utils/cloudinary.util.js"); await deleteFromCloudinary(course.intro_video_public_id, "video"); } catch (error) { console.error("Failed to delete old intro video:", error); }
  }
  await course.update({ intro_video_url: videoData.intro_video_url, intro_video_public_id: videoData.intro_video_public_id, intro_video_hls_url: videoData.intro_video_hls_url || null, intro_video_duration: videoData.intro_video_duration || 0 });
  return course;
};

export const deleteCourse = async (courseId, userId, userRole) => {
  const course = await Course.findByPk(courseId, { include: [{ model: Enrollment }] });
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.Enrollments.length > 0) { const error = new Error("Delete failed! Course has enrollments"); error.statusCode = 400; throw error; }
  if (course.instructor_id !== userId && userRole !== "admin") { const error = new Error("Not authorized to delete this course"); error.statusCode = 403; throw error; }
  await course.destroy();
  return { message: "Course deleted successfully" };
};

export const saveDraft = async (courseId, instructorId) => {
  const course = await Course.findByPk(courseId);
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.instructor_id !== instructorId) { const error = new Error("Not authorized to update this course"); error.statusCode = 403; throw error; }
  await course.update({ status: "draft", is_published: false });
  return course;
};

export const submitForReview = async (courseId, instructorId) => {
  const course = await Course.findByPk(courseId);
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.instructor_id !== instructorId) { const error = new Error("Not authorized to update this course"); error.statusCode = 403; throw error; }
  const chapters = await Chapter.count({ where: { course_id: courseId } });
  if (chapters === 0) { const error = new Error("Cannot submit for review: Course must have at least one chapter"); error.statusCode = 400; throw error; }
  await course.update({ status: "pending_review", submitted_for_review_at: new Date(), is_published: false });
  const admins = await User.findAll({ where: { role: "admin" } });
  const { Notification } = models;
  await Notification.bulkCreate(admins.map((admin) => ({ user_id: admin.id, type: "info", title: "New Course Pending Review", message: `Instructor ${instructorId} has submitted course "${course.title}" for review`, related_id: course.id, related_type: "course", is_read: false })));
  return course;
};

export const approveCourse = async (courseId, adminId) => {
  const course = await Course.findByPk(courseId);
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.status !== "pending_review") { const error = new Error("Course is not pending review"); error.statusCode = 400; throw error; }
  await course.update({ status: "approved", is_published: true, reviewed_at: new Date(), reviewed_by: adminId, rejection_reason: null });
  const { Notification } = models;
  await Notification.create({ user_id: course.instructor_id, type: "course_approved", title: "Course Approved", message: `Your course "${course.title}" has been approved and is now published`, related_id: course.id, related_type: "course", is_read: false });
  return course;
};

export const rejectCourse = async (courseId, adminId, rejectionReason) => {
  const course = await Course.findByPk(courseId);
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.status !== "pending_review") { const error = new Error("Course is not pending review"); error.statusCode = 400; throw error; }
  if (!rejectionReason || rejectionReason.trim().length < 10) { const error = new Error("Rejection reason must be at least 10 characters long"); error.statusCode = 400; throw error; }
  await course.update({ status: "rejected", is_published: false, reviewed_at: new Date(), reviewed_by: adminId, rejection_reason: rejectionReason });
  const { Notification } = models;
  await Notification.create({ user_id: course.instructor_id, type: "course_rejected", title: "Course Rejected", message: `Your course "${course.title}" has been rejected. Reason: ${rejectionReason}`, related_id: course.id, related_type: "course", is_read: false });
  return course;
};

export const getPendingCourses = async () => {
  return await Course.findAll({ where: { status: "pending_review" }, include: [{ model: User, as: "Instructor", attributes: ["id", "first_name", "last_name", "email"], include: [{ model: Profile }] }, { model: Chapter, include: [{ model: Lesson }] }], order: [["submitted_for_review_at", "ASC"]] });
};

export const getCoursePreview = async (courseId) => {
  const { CourseReview } = models;
  const course = await Course.findByPk(courseId, { include: [{ model: User, as: "Instructor", attributes: ["id", "first_name", "last_name", "email", "role"], include: [{ model: Profile, attributes: ["bio", "avatar_url", "headline"] }] }, { model: Chapter, where: { status: "approved" }, required: false, order: [["order_number", "ASC"]], include: [{ model: Lesson, attributes: ["id", "title", "lesson_type", "duration", "order_number", "is_preview", "video_url"], order: [["order_number", "ASC"]] }] }, { model: CourseReview, include: [{ model: User, attributes: ["id", "first_name", "last_name"] }], order: [["createdAt", "DESC"]], limit: 10 }] });
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (!course.is_published) { const error = new Error("Course is not available for preview"); error.statusCode = 403; throw error; }
  const enrollmentCount = await Enrollment.count({ where: { course_id: courseId } });
  const ratingStats = await CourseReview.findOne({ where: { course_id: courseId }, attributes: [[fn("AVG", col("rating")), "averageRating"], [fn("COUNT", col("id")), "reviewCount"]], raw: true });
  const previewLessons = [];
  if (course.Chapters) { for (const chapter of course.Chapters) { if (chapter.Lessons) { for (const lesson of chapter.Lessons) { if (lesson.is_preview && previewLessons.length < 3) { previewLessons.push({ id: lesson.id, title: lesson.title, lesson_type: lesson.lesson_type, duration: lesson.duration, video_url: lesson.video_url, chapter_title: chapter.title }); } } } } }
  const curriculum = course.Chapters ? course.Chapters.map((chapter) => ({ id: chapter.id, title: chapter.title, description: chapter.description, order_number: chapter.order_number, lesson_count: chapter.Lessons ? chapter.Lessons.length : 0, lessons: chapter.Lessons ? chapter.Lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, lesson_type: lesson.lesson_type, duration: lesson.duration, is_preview: lesson.is_preview })) : [] })) : [];
  let activeDiscount = null;
  if (course.have_discount) { const now = new Date(); const startDate = course.discount_start_date ? new Date(course.discount_start_date) : null; const endDate = course.discount_end_date ? new Date(course.discount_end_date) : null; if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) { let discountedPrice = course.price; if (course.discount_type === "percentage") { discountedPrice = course.price - (course.price * course.discount_value) / 100; } else if (course.discount_type === "fixed") { discountedPrice = course.price - course.discount_value; } discountedPrice = Math.max(0, discountedPrice); activeDiscount = { type: course.discount_type, value: course.discount_value, original_price: parseFloat(course.price), discounted_price: parseFloat(discountedPrice.toFixed(2)), end_date: endDate }; } }
  return { id: course.id, title: course.title, subtitle: course.subtitle, description: course.description, learning_objectives: course.learning_objectives, requirements: course.requirements, target_audience: course.target_audience, category: course.category, level: course.level, price: parseFloat(course.price), thumbnail_url: course.thumbnail_url, intro_video_url: course.intro_video_url, intro_video_hls_url: course.intro_video_hls_url, intro_video_duration: course.intro_video_duration, badge: course.badge, last_updated: course.updatedAt, instructor: { id: course.User.id, name: `${course.User.first_name} ${course.User.last_name}`, email: course.User.email, bio: course.User.Profile ? course.User.Profile.bio : null, avatar_url: course.User.Profile ? course.User.Profile.avatar_url : null, headline: course.User.Profile ? course.User.Profile.headline : null }, stats: { enrollment_count: enrollmentCount, average_rating: ratingStats.averageRating ? parseFloat(ratingStats.averageRating).toFixed(1) : null, review_count: parseInt(ratingStats.reviewCount) || 0 }, pricing: { price: parseFloat(course.price), has_discount: course.have_discount && activeDiscount !== null, discount: activeDiscount }, curriculum, preview_lessons: previewLessons, reviews: course.CourseReviews ? course.CourseReviews.map((review) => ({ id: review.id, rating: review.rating, review_text: review.review_text, reviewer_name: `${review.User.first_name} ${review.User.last_name}`, createdAt: review.createdAt })) : [] };
};

export const getPublicCurriculum = async (courseId) => {
  const course = await Course.findByPk(courseId, { include: [{ model: Chapter, where: { status: "approved" }, required: false, order: [["order_number", "ASC"]], include: [{ model: Lesson, attributes: ["id", "title", "lesson_type", "duration", "order_number", "is_preview"], order: [["order_number", "ASC"]] }] }] });
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (!course.is_published) { const error = new Error("Course is not published"); error.statusCode = 403; throw error; }
  const curriculum = course.Chapters ? course.Chapters.map((chapter) => ({ id: chapter.id, title: chapter.title, description: chapter.description, order_number: chapter.order_number, lesson_count: chapter.Lessons ? chapter.Lessons.length : 0, total_duration: chapter.Lessons ? chapter.Lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) : 0, lessons: chapter.Lessons ? chapter.Lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, lesson_type: lesson.lesson_type, duration: lesson.duration, is_preview: lesson.is_preview })) : [] })) : [];
  return { course_id: course.id, course_title: course.title, curriculum };
};

export const searchCourses = async (filters = {}) => {
  const { search, category, level, minPrice, maxPrice, sortBy = "relevance", page = 1, limit = 12 } = filters;
  const where = { is_published: true, status: "approved" };
  const offset = (page - 1) * limit;
  if (search) { where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }, { subtitle: { [Op.like]: `%${search}%` } }]; }
  if (category) { where.category = category; }
  if (level) { where.level = level; }
  if (minPrice !== undefined || maxPrice !== undefined) { where.price = {}; if (minPrice !== undefined) { where.price[Op.gte] = minPrice; } if (maxPrice !== undefined) { where.price[Op.lte] = maxPrice; } }
  let order = [];
  switch (sortBy) { case "popularity": order = [[literal("enrollment_count"), "DESC"]]; break; case "rating": order = [[literal("average_rating"), "DESC"]]; break; case "price_low_high": order = [["price", "ASC"]]; break; case "price_high_low": order = [["price", "DESC"]]; break; case "newest": order = [["createdAt", "DESC"]]; break; default: order = search ? [[literal("title LIKE '%" + search + "%'"), "DESC"]] : [["createdAt", "DESC"]]; break; }
  const courses = await Course.findAndCountAll({ where, include: [{ model: User, as: "Instructor", attributes: ["id", "first_name", "last_name", "email"] }, { model: Enrollment, attributes: [], required: false }, { model: models.CourseReview, attributes: [], required: false }], attributes: { include: [[fn("COUNT", fn("DISTINCT", col("Enrollments.id"))), "enrollment_count"], [fn("AVG", col("CourseReviews.rating")), "average_rating"]] }, group: ["Course.id", "User.id"], order, limit: parseInt(limit), offset: parseInt(offset), subQuery: false });
  const formattedCourses = courses.rows.map((course) => ({ id: course.id, title: course.title, subtitle: course.subtitle, description: course.description, category: course.category, level: course.level, price: parseFloat(course.price), thumbnail_url: course.thumbnail_url, badge: course.badge, instructor: { id: course.User.id, name: `${course.User.first_name} ${course.User.last_name}` }, enrollment_count: parseInt(course.dataValues.enrollment_count) || 0, average_rating: course.dataValues.average_rating ? parseFloat(course.dataValues.average_rating).toFixed(1) : null }));
  return { courses: formattedCourses, pagination: { total: courses.count.length, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(courses.count.length / limit) } };
};

export const getAllCategories = async () => {
  const categories = await Course.findAll({ where: { is_published: true, status: "approved" }, attributes: [[fn("DISTINCT", col("category")), "category"]], raw: true });
  return categories.map((c) => c.category).filter((c) => c !== null);
};

export const getFeaturedCourses = async (limit = 6) => {
  const courses = await Course.findAll({ where: { is_published: true, status: "approved", badge: { [Op.ne]: null } }, include: [{ model: User, as: "Instructor", attributes: ["id", "first_name", "last_name"] }], limit: parseInt(limit), order: [["createdAt", "DESC"]] });
  return courses.map((course) => ({ id: course.id, title: course.title, subtitle: course.subtitle, category: course.category, level: course.level, price: parseFloat(course.price), thumbnail_url: course.thumbnail_url, badge: course.badge, instructor: { id: course.User.id, name: `${course.User.first_name} ${course.User.last_name}` } }));
};

export const getPopularCourses = async (limit = 6) => {
  const courses = await Course.findAll({ where: { is_published: true, status: "approved" }, include: [{ model: User, as: "Instructor", attributes: ["id", "first_name", "last_name"] }, { model: Enrollment, attributes: [], required: false }], attributes: { include: [[fn("COUNT", col("Enrollments.id")), "enrollment_count"]] }, group: ["Course.id", "Instructor.id"], order: [[literal("enrollment_count"), "DESC"]], limit: parseInt(limit), subQuery: false });
  return courses.map((course) => ({ id: course.id, title: course.title, subtitle: course.subtitle, category: course.category, level: course.level, price: parseFloat(course.price), thumbnail_url: course.thumbnail_url, badge: course.badge, instructor: { id: course.User.id, name: `${course.User.first_name} ${course.User.last_name}` }, enrollment_count: parseInt(course.dataValues.enrollment_count) || 0 }));
};

export const canEditCourse = async (courseId, instructorId) => {
  const course = await Course.findByPk(courseId);
  if (!course) { const error = new Error("Course not found"); error.statusCode = 404; throw error; }
  if (course.instructor_id !== instructorId) { return { canEdit: false, reason: "Not authorized" }; }
  if (course.status === "pending_review") { return { canEdit: false, reason: "Course is pending review and cannot be edited" }; }
  return { canEdit: true };
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
