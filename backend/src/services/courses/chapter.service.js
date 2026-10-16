import chapterRepository from "../../repositories/courses/chapter.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";
import notificationRepository from "../../repositories/communication/notification.repository.js";
import userRepository from "../../repositories/auth/user.repository.js";
import Course from "../../models/courses/course.model.js";
import Lesson from "../../models/courses/lesson.model.js";

export const createChapter = async (chapterData, instructorId) => {
  const course = await Course.findById(chapterData.course_id).exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to create a chapter");
    error.statusCode = 401;
    throw error;
  }

  const chapterCount = await chapterRepository.countByCourseId(chapterData.course_id);
  chapterData.order_number = chapterCount + 1;

  return await chapterRepository.create(chapterData);
};

export const updateChapter = async (chapterId, updateData, instructorId) => {
  const chapter = await chapterRepository.findByIdRaw(chapterId);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

  if (!course || course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to update a chapter");
    error.statusCode = 401;
    throw error;
  }

  return await chapterRepository.updateById(chapterId, updateData);
};

export const deleteChapter = async (chapterId, instructorId) => {
  const chapter = await chapterRepository.findByIdRaw(chapterId);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

  if (!course || course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to delete a chapter");
    error.statusCode = 401;
    throw error;
  }

  await chapterRepository.deleteById(chapterId);

  return { message: "Chapter deleted successfully" };
};

export const submitChapterForReview = async (chapterId, instructorId) => {
  const chapter = await chapterRepository.findByIdRaw(chapterId);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id title").exec();

  if (!course || course.instructor_id !== instructorId) {
    const error = new Error("Not authorized to submit this chapter");
    error.statusCode = 403;
    throw error;
  }

  await chapterRepository.updateById(chapterId, {
    status: "pending_review",
    submitted_for_review_at: new Date(),
  });

  const admins = await userRepository.find({ role: "admin" }, { limit: 100 });

  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    type: "info",
    title: "New Chapter Pending Review",
    message: `Instructor ${instructorId} has submitted a new chapter "${chapter.title}" for course "${course.title}" for review`,
    related_id: chapter._id.toString(),
    related_type: "chapter",
    is_read: false,
  }));

  if (notifications.length > 0) {
    await notificationRepository.insertMany(notifications);
  }

  return await chapterRepository.findByIdRaw(chapterId);
};

export const approveChapter = async (chapterId, adminId) => {
  const chapter = await chapterRepository.findByIdRaw(chapterId);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  if (chapter.status !== "pending_review") {
    const error = new Error("Chapter is not pending review");
    error.statusCode = 400;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id title").exec();

  await chapterRepository.updateById(chapterId, {
    status: "approved",
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: null,
  });

  await notificationRepository.create({
    user_id: course?.instructor_id,
    type: "chapter_approved",
    title: "Chapter Approved",
    message: `Your chapter "${chapter.title}" in course "${course?.title}" has been approved`,
    related_id: chapter._id.toString(),
    related_type: "chapter",
    is_read: false,
  });

  return await chapterRepository.findByIdRaw(chapterId);
};

export const rejectChapter = async (chapterId, adminId, rejectionReason) => {
  const chapter = await chapterRepository.findByIdRaw(chapterId);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  if (chapter.status !== "pending_review") {
    const error = new Error("Chapter is not pending review");
    error.statusCode = 400;
    throw error;
  }

  if (!rejectionReason || rejectionReason.trim().length < 10) {
    const error = new Error("Rejection reason must be at least 10 characters long");
    error.statusCode = 400;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id title").exec();

  await chapterRepository.updateById(chapterId, {
    status: "rejected",
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: rejectionReason,
  });

  await notificationRepository.create({
    user_id: course?.instructor_id,
    type: "chapter_rejected",
    title: "Chapter Rejected",
    message: `Your chapter "${chapter.title}" in course "${course?.title}" has been rejected. Reason: ${rejectionReason}`,
    related_id: chapter._id.toString(),
    related_type: "chapter",
    is_read: false,
  });

  return await chapterRepository.findByIdRaw(chapterId);
};

export const getPendingChapters = async () => {
  const chapters = await chapterRepository.findByFilter({ status: "pending_review" });

  // Group by course_id
  const grouped = {};
  for (const chapter of chapters) {
    const courseId = chapter.course_id;
    if (!grouped[courseId]) {
      const course = await Course.findById(courseId)
        .populate("Instructor", "id first_name last_name email")
        .select("id title instructor_id")
        .exec();
      grouped[courseId] = { course, chapters: [] };
    }
    grouped[courseId].chapters.push(chapter);
  }

  return Object.values(grouped);
};

export const getApprovedChapters = async (courseId) => {
  return await chapterRepository.findByFilter({
    course_id: courseId,
    status: "approved",
  });
};

export const createChapterWithReview = async (chapterData, instructorId) => {
  const course = await Course.findById(chapterData.course_id)
    .select("instructor_id title is_published status")
    .exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to create a chapter");
    error.statusCode = 403;
    throw error;
  }

  const chapterCount = await chapterRepository.countByCourseId(chapterData.course_id);
  chapterData.order_number = chapterCount + 1;

  if (course.is_published && course.status === "approved") {
    chapterData.status = "pending_review";
    chapterData.submitted_for_review_at = new Date();

    const chapter = await chapterRepository.create(chapterData);

    const admins = await userRepository.find({ role: "admin" }, { limit: 100 });
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: "info",
      title: "New Chapter Pending Review",
      message: `Instructor ${instructorId} has added a new chapter "${chapter.title}" to course "${course.title}"`,
      related_id: chapter._id.toString(),
      related_type: "chapter",
      is_read: false,
    }));

    if (notifications.length > 0) {
      await notificationRepository.insertMany(notifications);
    }

    return chapter;
  }

  chapterData.status = "approved";
  return await chapterRepository.create(chapterData);
};

export default {
  createChapter,
  updateChapter,
  deleteChapter,
  submitChapterForReview,
  approveChapter,
  rejectChapter,
  getPendingChapters,
  getApprovedChapters,
  createChapterWithReview,
};
