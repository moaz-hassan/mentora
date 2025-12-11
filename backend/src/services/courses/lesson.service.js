import models from "../../models/index.js";
const { Lesson, Course, Chapter, LessonMaterial } = models;

export const getLessonById = async (lessonId) => {
  const lesson = await Lesson.findByPk(lessonId, {
    include: [{ model: Course }],
  });

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  return lesson;
};

export const createLesson = async (lessonData, instructorId) => {
  const chapter = await Chapter.findByPk(lessonData.chapter_id, {
    include: [{ model: Lesson, attributes: ["order_number"] }],
  });

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(chapter.course_id, {
    attributes: ["instructor_id"],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error(
      "You are not authorized to create a lesson for this course"
    );
    error.statusCode = 403;
    throw error;
  }

  const lessonType = lessonData.lesson_type || 'video';

  // Validate lesson type requirements
  if (lessonType === 'video' && !lessonData.video_url) {
    const error = new Error('Video URL is required for video lessons');
    error.statusCode = 400;
    throw error;
  }

  if (lessonType === 'text' && !lessonData.content) {
    const error = new Error('Content is required for text lessons');
    error.statusCode = 400;
    throw error;
  }

  // Validate Cloudinary URL if video lesson
  if (lessonType === 'video' && lessonData.video_url) {
    const { validateCloudinaryUrl } = await import('../../controllers/media/cloudinary.controller.js');
    const isValid = validateCloudinaryUrl(lessonData.video_url, lessonData.video_public_id);
    
    if (!isValid) {
      const error = new Error('Invalid video URL or public ID');
      error.statusCode = 400;
      throw error;
    }
  }

  // Sanitize HTML content if lesson type is text
  if (lessonType === 'text' && lessonData.content) {
    const { sanitizeLessonContent } = await import('../../utils/sanitize.util.js');
    lessonData.content = sanitizeLessonContent(lessonData.content);
  }

  // Create lesson record with video URL from frontend
  lessonData.order_number = chapter.Lessons.length + 1;

  const lesson = await Lesson.create({
    chapter_id: lessonData.chapter_id,
    title: lessonData.title,
    lesson_type: lessonType,
    content: lessonData.content || '',
    video_url: lessonData.video_url || null,
    video_public_id: lessonData.video_public_id || null,
    hls_url: lessonData.hls_url || null,
    is_preview: lessonData.is_preview || false,
    duration: lessonData.duration || 0,
    order_number: lessonData.order_number,
  });

  // Create materials if provided
  if (lessonData.materials && Array.isArray(lessonData.materials) && lessonData.materials.length > 0) {
    const materialsToCreate = lessonData.materials.map((material, index) => ({
      lesson_id: lesson.id,
      filename: material.filename,
      url: material.url,
      public_id: material.public_id,
      file_type: material.file_type,
      file_size: material.file_size,
      order_number: index,
    }));

    await LessonMaterial.bulkCreate(materialsToCreate);
  }

  // Reload lesson with materials
  const lessonWithMaterials = await Lesson.findByPk(lesson.id, {
    include: [{
      model: LessonMaterial,
      as: 'materials',
      attributes: ['id', 'filename', 'url', 'file_type', 'file_size', 'order_number'],
    }],
  });

  return lessonWithMaterials;
};

export const updateLesson = async (lessonId, updateData, instructorId) => {
  const lesson = await Lesson.findByPk(lessonId);

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await Chapter.findByPk(lesson.chapter_id,{
    attributes: ["course_id"],
  });

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(chapter.course_id, {
    attributes: ["instructor_id"],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to update this lesson");
    error.statusCode = 403;
    throw error;
  }

  await lesson.update(updateData);

  return lesson;
};

export const deleteLesson = async (lessonId, instructorId) => {
  const lesson = await Lesson.findByPk(lessonId);

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await Chapter.findByPk(lesson.chapter_id, {
    attributes: ["course_id"],
  });

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findByPk(chapter.course_id, {
    attributes: ["instructor_id"],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to delete this lesson");
    error.statusCode = 403;
    throw error;
  }

  await lesson.destroy();

  return { message: "Lesson deleted successfully" };
};
