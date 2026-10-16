import lessonRepository from "../../repositories/courses/lesson.repository.js";
import chapterRepository from "../../repositories/courses/chapter.repository.js";
import enrollmentRepository from "../../repositories/courses/enrollment.repository.js";
import LessonMaterial from "../../models/courses/lessonMaterial.model.js";
import Course from "../../models/courses/course.model.js";

export const getLessonById = async (lessonId) => {
  const lesson = await lessonRepository.findById(lessonId);

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  return lesson;
};

export const createLesson = async (lessonData, instructorId) => {
  const chapter = await chapterRepository.findByIdRaw(lessonData.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You are not authorized to create a lesson for this course");
    error.statusCode = 403;
    throw error;
  }

  const lessonType = lessonData.lesson_type || "video";

  if (lessonType === "video" && !lessonData.video_url) {
    const error = new Error("Video URL is required for video lessons");
    error.statusCode = 400;
    throw error;
  }

  if (lessonType === "text" && !lessonData.content) {
    const error = new Error("Content is required for text lessons");
    error.statusCode = 400;
    throw error;
  }

  if (lessonType === "video" && lessonData.video_url) {
    const { validateCloudinaryUrl } = await import(
      "../../controllers/media/cloudinary.controller.js"
    );
    const isValid = validateCloudinaryUrl(lessonData.video_url, lessonData.video_public_id);
    if (!isValid) {
      const error = new Error("Invalid video URL or public ID");
      error.statusCode = 400;
      throw error;
    }
  }

  if (lessonType === "text" && lessonData.content) {
    const { sanitizeLessonContent } = await import("../../utils/sanitize.util.js");
    lessonData.content = sanitizeLessonContent(lessonData.content);
  }

  const lessonCount = await lessonRepository.countByChapterId(lessonData.chapter_id);
  lessonData.order_number = lessonCount + 1;

  const lesson = await lessonRepository.create({
    chapter_id: lessonData.chapter_id,
    title: lessonData.title,
    lesson_type: lessonType,
    content: lessonData.content || "",
    video_url: lessonData.video_url || null,
    video_public_id: lessonData.video_public_id || null,
    hls_url: lessonData.hls_url || null,
    is_preview: lessonData.is_preview || false,
    duration: lessonData.duration || 0,
    order_number: lessonData.order_number,
  });

  if (lessonData.materials && Array.isArray(lessonData.materials) && lessonData.materials.length > 0) {
    const materialsToCreate = lessonData.materials.map((material, index) => ({
      lesson_id: lesson._id.toString(),
      filename: material.filename,
      url: material.url,
      public_id: material.public_id,
      file_type: material.file_type,
      file_size: material.file_size,
      order_number: index,
    }));

    await LessonMaterial.insertMany(materialsToCreate);
  }

  // Return lesson with materials populated
  return await lessonRepository.findById(lesson._id.toString());
};

export const updateLesson = async (lessonId, updateData, instructorId) => {
  const lesson = await lessonRepository.findByIdRaw(lessonId);

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(lesson.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

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

  return await lessonRepository.updateById(lessonId, updateData);
};

export const deleteLesson = async (lessonId, instructorId) => {
  const lesson = await lessonRepository.findByIdRaw(lessonId);

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(lesson.chapter_id);

  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

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

  await lessonRepository.deleteById(lessonId);

  return { message: "Lesson deleted successfully" };
};

export const isUserAuthorizedForLesson = async (lessonId, user) => {
  const lesson = await lessonRepository.findByIdRaw(lessonId);
  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  // Preview lessons are public
  if (lesson.is_preview) return true;

  if (!user) return false;

  if (user.role === "admin") return true;

  const chapter = await chapterRepository.findByIdRaw(lesson.chapter_id);
  if (!chapter) return false;

  const course = await Course.findById(chapter.course_id).select("instructor_id").exec();

  if (user.role === "instructor" && course?.instructor_id === user.id) return true;

  const enrollment = await enrollmentRepository.findByStudentAndCourse(
    user.id,
    chapter.course_id
  );
  return !!enrollment;
};

export const getPlaybackUrl = async (lessonId, user) => {
  const lesson = await lessonRepository.findByIdRaw(lessonId);
  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  if (lesson.is_preview) {
    if (lesson.video_public_id) {
      const { getSignedUrl } = await import("../../utils/cloudinary.util.js");
      const signed = getSignedUrl(lesson.video_public_id, "video", "authenticated");
      return { url: signed, expires_in: 3600 };
    }
    return { url: lesson.hls_url || lesson.video_url || null, expires_in: 0 };
  }

  const allowed = await isUserAuthorizedForLesson(lessonId, user);
  if (!allowed) {
    const error = new Error("You are not authorized to access this lesson");
    error.statusCode = 403;
    throw error;
  }

  if (lesson.video_public_id) {
    const { getSignedUrl } = await import("../../utils/cloudinary.util.js");
    const signed = getSignedUrl(lesson.video_public_id, "video", "authenticated");
    return { url: signed, expires_in: 3600 };
  }

  return { url: lesson.hls_url || lesson.video_url || null, expires_in: 0 };
};

export default {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  isUserAuthorizedForLesson,
  getPlaybackUrl,
};
