import Cookies from "js-cookie";
import { createChapter } from "@/lib/apiCalls/chapters/createChapter";
import { createLesson } from "@/lib/apiCalls/lessons/createLesson";
import { createQuiz } from "@/lib/apiCalls/quizzes/createQuiz";

/**
 * Service for handling course structure operations (chapters, lessons, quizzes)
 */

/**
 * Validate quiz data
 * @param {Object} quiz - Quiz object to validate
 * @throws {Error} If validation fails
 */
export function validateQuiz(quiz) {
  if (!quiz.title || !quiz.title.trim()) {
    throw new Error("Quiz title is required");
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    throw new Error(`Quiz "${quiz.title}" must have at least one question`);
  }

  // Filter out empty questions
  const validQuestions = quiz.questions.filter(
    (q) => q.question && q.question.trim()
  );

  if (validQuestions.length === 0) {
    throw new Error(
      `Quiz "${quiz.title}" has no valid questions. Please add at least one question with text.`
    );
  }

  // Validate each question
  validQuestions.forEach((question, index) => {
    if (!question.options || question.options.length === 0) {
      throw new Error(
        `Question ${index + 1} in quiz "${quiz.title}" has no options`
      );
    }

    const hasValidOptions = Array.isArray(question.options)
      ? question.options.some((opt) => {
          const key = Object.keys(opt)[0];
          return opt[key] && opt[key].trim();
        })
      : false;

    if (!hasValidOptions) {
      throw new Error(
        `Question ${index + 1} in quiz "${quiz.title}" has no option text. Please fill in at least one option.`
      );
    }

    if (!question.answer && !question.correctAnswer) {
      throw new Error(
        `Question ${index + 1} in quiz "${quiz.title}" has no correct answer selected`
      );
    }
  });

  return validQuestions;
}

/**
 * Transform quiz questions to backend format
 * @param {Array} questions - Array of question objects
 * @returns {Array} Transformed questions
 */
export function transformQuizQuestions(questions) {
  return questions.map((q) => {
    let options = q.options;

    // Convert object format to array format if needed
    if (!Array.isArray(options) && typeof options === "object") {
      options = Object.entries(options).map(([key, value]) => ({
        [key]: value,
      }));
    }

    if (!options) {
      options = [{ a: "" }, { b: "" }, { c: "" }, { d: "" }];
    }

    return {
      question: q.question,
      options: options,
      answer: q.answer || q.correctAnswer,
    };
  });
}

/**
 * Validate lesson data
 * @param {Object} lesson - Lesson object to validate
 * @throws {Error} If validation fails
 */
export function validateLesson(lesson) {
  if (!lesson.title || !lesson.title.trim()) {
    throw new Error("Lesson title is required");
  }
}

/**
 * Process and create a quiz
 * @param {Object} quiz - Quiz data
 * @param {string|number} chapterId - Chapter ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Created quiz response
 */
export async function processQuiz(quiz, chapterId, token) {
  const validQuestions = validateQuiz(quiz);
  const transformedQuestions = transformQuizQuestions(validQuestions);

  const quizResponse = await createQuiz(
    {
      chapter_id: chapterId,
      title: quiz.title,
      questions: transformedQuestions,
    },
    token
  );

  if (!quizResponse.success) {
    throw new Error(
      quizResponse.message || `Failed to create quiz: ${quiz.title}`
    );
  }

  return quizResponse;
}

/**
 * Process and create a lesson
 * @param {Object} lesson - Lesson data
 * @param {string|number} chapterId - Chapter ID
 * @param {string} token - Auth token
 * @param {Function} uploadVideo - Video upload function
 * @returns {Promise<Object>} Created lesson response
 */
export async function processLesson(lesson, chapterId, token, uploadVideo) {
  validateLesson(lesson);

  let videoUrl = null;
  let videoPublicId = null;
  let hlsUrl = null;
  let duration = lesson.duration || 0;

  // Handle video lessons
  if (lesson.type === "video") {
    if (lesson.videoUrl && !lesson.videoFile) {
      // Existing video
      videoUrl = lesson.videoUrl;
      duration = lesson.duration || 0;
    } else if (lesson.videoFile) {
      // Upload new video
      const uploadResult = await uploadVideo(lesson.videoFile, lesson.title);
      videoUrl = uploadResult.videoUrl;
      videoPublicId = uploadResult.videoPublicId;
      hlsUrl = uploadResult.hlsUrl;
      duration = uploadResult.duration;
    } else {
      throw new Error(`Video lesson "${lesson.title}" requires a video file`);
    }
  }

  // Handle materials - upload pending materials
  let materialsToSave = [];
  if (lesson.materials && lesson.materials.length > 0) {
    const { uploadFileToCloudinary } = await import("@/lib/apiCalls/cloudinary/uploadFileToCloudinary");
    
    for (const material of lesson.materials) {
      if (material.pending && material.file) {
        // Upload pending material
        try {
          const cloudinaryResult = await uploadFileToCloudinary(material.file);
          materialsToSave.push({
            filename: material.filename,
            url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
            file_type: material.file_type,
            file_size: material.file_size,
          });
        } catch (error) {
          console.error(`Failed to upload material ${material.filename}:`, error);
          throw new Error(`Failed to upload material: ${material.filename}`);
        }
      } else if (!material.pending) {
        // Already uploaded material
        materialsToSave.push({
          filename: material.filename,
          url: material.url,
          public_id: material.public_id,
          file_type: material.file_type,
          file_size: material.file_size,
        });
      }
    }
  }

  const lessonResponse = await createLesson(
    {
      chapter_id: chapterId,
      title: lesson.title,
      lesson_type: lesson.type,
      content: lesson.textContent || "",
      video_url: videoUrl,
      video_public_id: videoPublicId,
      hls_url: hlsUrl,
      duration: duration,
      is_preview: lesson.isPreview || false,
      order_number: lesson.order_number,
      materials: materialsToSave.length > 0 ? materialsToSave : undefined,
    },
    token
  );

  if (!lessonResponse.success) {
    throw new Error(
      lessonResponse.message || `Failed to create lesson: ${lesson.title}`
    );
  }

  return lessonResponse;
}

/**
 * Process a single item (lesson or quiz)
 * @param {Object} item - Item to process
 * @param {string|number} chapterId - Chapter ID
 * @param {string} token - Auth token
 * @param {Function} uploadVideo - Video upload function
 * @returns {Promise<Object>} Created item response
 */
export async function processItem(item, chapterId, token, uploadVideo) {
  if ("questions" in item) {
    return await processQuiz(item, chapterId, token);
  } else if (item.type === "video" || item.type === "text") {
    return await processLesson(item, chapterId, token, uploadVideo);
  } else {
    throw new Error(`Unknown item type: ${item.type}`);
  }
}

/**
 * Save all course changes (chapters, lessons, quizzes)
 * @param {string} courseId - Course ID
 * @param {Object} courseData - Course data with chapters
 * @param {Function} uploadVideo - Video upload function
 * @returns {Promise<void>}
 */
export async function saveAllCourseChanges(
  courseId,
  courseData,
  uploadVideo
) {
  const token = Cookies.get("authToken");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const chapters = courseData?.chapters || [];

  // Separate existing and new chapters
  const existingChapters = chapters.filter(
    (ch) => ch.id && !ch.id.toString().startsWith("chapter-")
  );
  const newChapters = chapters.filter(
    (ch) => ch.id && ch.id.toString().startsWith("chapter-")
  );

  // Process existing chapters - only add new items
  for (const chapter of existingChapters) {
    const newItems = (chapter.items || []).filter(
      (item) =>
        item.id &&
        (item.id.toString().startsWith("lesson-") ||
          item.id.toString().startsWith("quiz-"))
    );

    if (newItems.length > 0) {
      for (const item of newItems) {
        await processItem(item, chapter.id, token, uploadVideo);
      }
    }
  }

  // Create new chapters with their items
  const existingChapterCount = existingChapters.length;

  for (let i = 0; i < newChapters.length; i++) {
    const chapter = newChapters[i];
    const chapterOrderNumber = existingChapterCount + i + 1;

    // Create the chapter
    const chapterResponse = await createChapter(
      {
        course_id: courseId,
        title: chapter.title,
        description: chapter.description || "",
        order_number: chapterOrderNumber,
      },
      token
    );

    if (!chapterResponse.success) {
      throw new Error(
        chapterResponse.message || `Failed to create chapter: ${chapter.title}`
      );
    }

    const newChapterId = chapterResponse.data.id;

    // Process all items in the new chapter
    if (chapter.items && chapter.items.length > 0) {
      for (const item of chapter.items) {
        await processItem(item, newChapterId, token, uploadVideo);
      }
    }
  }
}
