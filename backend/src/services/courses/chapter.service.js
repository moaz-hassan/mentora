import models from "../../models/index.js";

const { Chapter, Course } = models;

export const createChapter = async (chapterData, instructorId) => {
  const course = await Course.findByPk(chapterData.course_id, {
    include: [{ model: Chapter }],
  });

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

  chapterData.order_number = course.Chapters.length + 1;

  const chapter = await Chapter.create(chapterData);

  return chapter;
};

export const updateChapter = async (chapterId, updateData, instructorId) => {
  const chapter = await Chapter.findByPk(chapterId, {
    include: [{ model: Course }],
  });

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  if (chapter.Course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to update a chapter");
    error.statusCode = 401;
    throw error;
  }

  await chapter.update(updateData);

  return chapter;
};

export const deleteChapter = async (chapterId, instructorId) => {
  const chapter = await Chapter.findByPk(chapterId, {
    include: [{ model: Course }],
  });

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  if (chapter.Course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to delete a chapter");
    error.statusCode = 401;
    throw error;
  }

  await chapter.destroy();

  return { message: "Chapter deleted successfully" };
};


export const submitChapterForReview = async (chapterId, instructorId) => {
  const chapter = await Chapter.findByPk(chapterId, {
    include: [{ model: Course }],
  });

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  if (chapter.Course.instructor_id !== instructorId) {
    const error = new Error("Not authorized to submit this chapter");
    error.statusCode = 403;
    throw error;
  }

  
  await chapter.update({
    status: "pending_review",
    submitted_for_review_at: new Date(),
  });

  
  const { User, Notification } = models;
  const admins = await User.findAll({ where: { role: "admin" } });

  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    type: "info",
    title: "New Chapter Pending Review",
    message: `Instructor ${instructorId} has submitted a new chapter "${chapter.title}" for course "${chapter.Course.title}" for review`,
    related_id: chapter.id,
    related_type: "chapter",
    is_read: false,
  }));

  await Notification.bulkCreate(notifications);

  return chapter;
};


export const approveChapter = async (chapterId, adminId) => {
  const chapter = await Chapter.findByPk(chapterId, {
    include: [{ model: Course }],
  });

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

  
  await chapter.update({
    status: "approved",
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: null,
  });

  
  const { Notification } = models;
  await Notification.create({
    user_id: chapter.Course.instructor_id,
    type: "chapter_approved",
    title: "Chapter Approved",
    message: `Your chapter "${chapter.title}" in course "${chapter.Course.title}" has been approved`,
    related_id: chapter.id,
    related_type: "chapter",
    is_read: false,
  });

  return chapter;
};


export const rejectChapter = async (chapterId, adminId, rejectionReason) => {
  const chapter = await Chapter.findByPk(chapterId, {
    include: [{ model: Course }],
  });

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
    const error = new Error(
      "Rejection reason must be at least 10 characters long"
    );
    error.statusCode = 400;
    throw error;
  }

  
  await chapter.update({
    status: "rejected",
    reviewed_at: new Date(),
    reviewed_by: adminId,
    rejection_reason: rejectionReason,
  });

  
  const { Notification } = models;
  await Notification.create({
    user_id: chapter.Course.instructor_id,
    type: "chapter_rejected",
    title: "Chapter Rejected",
    message: `Your chapter "${chapter.title}" in course "${chapter.Course.title}" has been rejected. Reason: ${rejectionReason}`,
    related_id: chapter.id,
    related_type: "chapter",
    is_read: false,
  });

  return chapter;
};


export const getPendingChapters = async () => {
  const chapters = await Chapter.findAll({
    where: { status: "pending_review" },
    include: [
      {
        model: Course,
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      },
    ],
    order: [["submitted_for_review_at", "ASC"]],
  });

  
  const groupedChapters = chapters.reduce((acc, chapter) => {
    const courseId = chapter.course_id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: chapter.Course,
        chapters: [],
      };
    }
    acc[courseId].chapters.push(chapter);
    return acc;
  }, {});

  return Object.values(groupedChapters);
};


export const getApprovedChapters = async (courseId) => {
  const chapters = await Chapter.findAll({
    where: {
      course_id: courseId,
      status: "approved",
    },
    include: [{ model: models.Lesson }],
    order: [
      ["order_number", "ASC"],
      [models.Lesson, "order_number", "ASC"],
    ],
  });

  return chapters;
};


export const createChapterWithReview = async (chapterData, instructorId) => {
  const course = await Course.findByPk(chapterData.course_id, {
    include: [{ model: Chapter }],
  });

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

  chapterData.order_number = course.Chapters.length + 1;

  
  if (course.is_published && course.status === "approved") {
    chapterData.status = "pending_review";
    chapterData.submitted_for_review_at = new Date();

    const chapter = await Chapter.create(chapterData);

    
    const { User, Notification } = models;
    const admins = await User.findAll({ where: { role: "admin" } });

    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: "info",
      title: "New Chapter Pending Review",
      message: `Instructor ${instructorId} has added a new chapter "${chapter.title}" to course "${course.title}"`,
      related_id: chapter.id,
      related_type: "chapter",
      is_read: false,
    }));

    await Notification.bulkCreate(notifications);

    return chapter;
  }

  
  chapterData.status = "approved";
  const chapter = await Chapter.create(chapterData);

  return chapter;
};
