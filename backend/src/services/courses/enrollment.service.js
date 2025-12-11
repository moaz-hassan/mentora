import models from "../../models/index.js";

const { Enrollment, Course, User, Chapter, Lesson, Profile, Quiz, Category, LessonMaterial, ChatRoom, ChatParticipant } = models;

export const getAllEnrollments = async (userId) => {
  const enrollments = await Enrollment.findAll({
    where: { student_id: userId },
    attributes: ["id", "student_id", "course_id", "enrolled_at", "progress"],
    include: [
      {
        model: Course,
        attributes: [
          "id",
          "title",
          "description",
          "thumbnail_url",
          "createdAt",
        ],
        include:[{
          model:Category,
          attributes:["name"]
        }]
      },
    ],
    order: [[Course, "createdAt", "DESC"]],
  });

  return enrollments;
};

export const checkEnrollment = async (courseId, studentId) => {
  const enrollment = await Enrollment.findOne({
    where: {
      course_id: courseId,
      student_id: studentId,
    },
  });

  return !!enrollment;
};

export const getEnrollmentById = async (enrollmentId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId, {
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name"],
        include: [
          {
            model: Profile,
            attributes: ["bio", "headline", "avatar_url", "social_links"],
          },
        ],
      },
      {
        model: Course,
        attributes: [
          "id",
          "title",
          "description",
          "category",
          "thumbnail_url",
          "createdAt",
        ],
        include: [
          {
            model: Chapter,
            attributes: ["id", "title", "description", "order_number"],
            include: [
              {
                model: Lesson,
                attributes: ["id", "title", "duration", "order_number"],
              },
              {
                model: Quiz,
                attributes: ["id", "title", "order_number"],
              },
            ],
          },
        ],
      },
    ],
    order: [
      [Course, Chapter, "order_number", "ASC"],
      [Course, Chapter, Lesson, "order_number", "ASC"],
      [Course, Chapter, Quiz, "order_number", "ASC"],
    ],
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  // Get chat membership for this course
  const courseId = enrollment.Course?.id;
  const studentId = enrollment.student_id;
  let chatMembership = { isMember: false, roomId: null };

  if (courseId && studentId) {
    const chatRoom = await ChatRoom.findOne({
      where: { course_id: courseId, type: "group" },
    });

    if (chatRoom) {
      const participant = await ChatParticipant.findOne({
        where: { room_id: chatRoom.id, user_id: studentId, is_active: true },
      });
      chatMembership = {
        isMember: !!participant,
        roomId: participant ? chatRoom.id : null,
      };
    }
  }

  // Add chatMembership to enrollment response
  const enrollmentData = enrollment.toJSON();
  enrollmentData.chatMembership = chatMembership;

  return enrollmentData;
};

export const createEnrollment = async (course_id, studentId) => {
  const course = await Course.findByPk(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const existingEnrollment = await Enrollment.findOne({
    where: { student_id: studentId, course_id },
  });

  if (existingEnrollment) {
    const error = new Error("Already enrolled in this course");
    error.statusCode = 400;
    throw error;
  }

  // Allow enrollment regardless of price (Payment logic removed)
  const enrollment = await Enrollment.create({
    student_id: studentId,
    course_id,
  });
  return enrollment;
};

import { updateProgress, completeLesson } from "./progress.service.js";

export { updateProgress, completeLesson };


/**
 * Get student progress for an enrollment
 */
export const getProgress = async (enrollmentId, studentId) => {
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  return enrollment.progress;
};

/**
 * Get lesson detail for enrolled student (lazy loading)
 * Returns full lesson content including video URLs and materials
 */
/**
 * Step 1: Verify access and update progress (Uncached)
 */
export const verifyEnrollmentAndUpdateProgress = async (enrollmentId, lessonId, studentId) => {
  // Verify enrollment exists and belongs to student
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found or access denied");
    error.statusCode = 403;
    throw error;
  }

  // Get lightweight lesson data to verify course relation
  const lesson = await Lesson.findByPk(lessonId, {
    attributes: ["id", "chapter_id"],
  });

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify lesson belongs to enrolled course
  const chapter = await Chapter.findByPk(lesson.chapter_id, {
    attributes: ["id", "course_id"],
  });
  
  if (!chapter || chapter.course_id !== enrollment.course_id) {
    const error = new Error("Lesson does not belong to enrolled course");
    error.statusCode = 403;
    throw error;
  }

  // Update current position
  const progress = enrollment.progress || {};
  progress.currentLessonId = lessonId;
  progress.currentChapterId = lesson.chapter_id;
  progress.lastAccessed = new Date();
  await enrollment.update({ progress });

  return { hasAccess: true };
};

/**
 * Step 2: Get heavy lesson content (Cached)
 */
export const getLessonContent = async (lessonId) => {
  const lesson = await Lesson.findByPk(lessonId, {
    include: [
      {
        model: LessonMaterial,
        as: "materials",
        attributes: ["id", "filename", "url", "file_type", "file_size", "order_number"],
        order: [["order_number", "ASC"]],
      },
    ],
  });

  if (!lesson) return null;

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
    chapter_id: lesson.chapter_id,
    materials: lesson.materials || [],
  };
};

/**
 * Get quiz detail for enrolled student (lazy loading)
 * Returns full quiz content including questions
 */
export const getQuizDetail = async (enrollmentId, quizId, studentId) => {
  // Verify enrollment exists and belongs to student
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found or access denied");
    error.statusCode = 403;
    throw error;
  }

  // Get quiz with questions
  const quiz = await Quiz.findByPk(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify quiz belongs to enrolled course
  const chapter = await Chapter.findByPk(quiz.chapter_id);
  if (!chapter || chapter.course_id !== enrollment.course_id) {
    const error = new Error("Quiz does not belong to enrolled course");
    error.statusCode = 403;
    throw error;
  }

  // Strip correct answers from questions
  const sanitizedQuestions = (quiz.questions || []).map(q => {
    const { correctAnswer, ...rest } = q;
    return rest;
  });

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    order_number: quiz.order_number,
    chapter_id: quiz.chapter_id,
    questions: sanitizedQuestions,
  };
};

/**
 * Submit quiz answers and get results
 * POST /api/enrollments/:enrollmentId/quizzes/:quizId/submit
 */
export const submitQuiz = async (enrollmentId, quizId, studentId, answers) => {
  // Verify enrollment exists and belongs to student
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found or access denied");
    error.statusCode = 403;
    throw error;
  }

  // Get quiz with questions and correct answers
  const quiz = await Quiz.findByPk(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  // Calculate score
  const questions = quiz.questions || [];
  let correctCount = 0;
  const results = {};

  questions.forEach((question, index) => {
    // Handle answers object with string or number keys
    const rawUserAnswer = answers[index] || answers[String(index)];
    
    // Normalize answers for comparison (trim whitespace)
    const userAnswer = rawUserAnswer ? String(rawUserAnswer).trim() : null;
    
    // Check both correctAnswer (standard) and answer (legacy/frontend creation)
    const correctVal = question.correctAnswer || question.answer;
    const correctAnswer = correctVal ? String(correctVal).trim() : null;
    
    const isCorrect = userAnswer && correctAnswer && userAnswer === correctAnswer;
    
    if (isCorrect) {
      correctCount++;
    }

    results[index] = {
      isCorrect,
      correctAnswer: question.correctAnswer // Return raw correct answer for feedback
    };
    
    console.log(`Question ${index}: User Answer "${userAnswer}" vs Correct "${correctAnswer}" -> ${isCorrect}`);
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 70; // 70% passing grade

  // Update progress if passed
  let updatedProgress = null;
  if (passed) {
    const updatedEnrollment = await updateProgress(enrollmentId, studentId, {
      completedQuizId: quizId,
      quizScore: score
    });
    updatedProgress = updatedEnrollment.progress;
  }

  return {
    score,
    passed,
    correctCount,
    totalQuestions: questions.length,
    results, // Detailed results for frontend feedback
    progress: updatedProgress
  };
};

/**
 * Gift a course to another user (free courses only)
 * @param {string} courseId - Course ID to gift
 * @param {string} senderId - User ID of the sender
 * @param {string} recipientEmail - Email of the recipient
 * @param {string} personalMessage - Optional personal message
 * @returns {Object} Gift enrollment data
 */
export const giftCourse = async (courseId, senderId, recipientEmail, personalMessage = "") => {
  // Import email service here to avoid circular dependency
  const { sendGiftCourseEmail } = await import("../auth/email.service.js");

  // Find the course
  const course = await Course.findByPk(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }



  // Find the recipient user by email
  const recipient = await User.findOne({ where: { email: recipientEmail } });
  if (!recipient) {
    const error = new Error("Recipient not found. They must be a registered user.");
    error.statusCode = 404;
    throw error;
  }

  // Check if sender is trying to gift to themselves
  if (recipient.id === senderId) {
    const error = new Error("You cannot gift a course to yourself");
    error.statusCode = 400;
    throw error;
  }

  // Check if recipient is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    where: { student_id: recipient.id, course_id: courseId },
  });

  if (existingEnrollment) {
    const error = new Error("Recipient is already enrolled in this course");
    error.statusCode = 400;
    throw error;
  }

  // Get sender info
  const sender = await User.findByPk(senderId);
  if (!sender) {
    const error = new Error("Sender not found");
    error.statusCode = 404;
    throw error;
  }

  // Create enrollment for recipient
  const enrollment = await Enrollment.create({
    student_id: recipient.id,
    course_id: courseId,
    gifted_by: senderId,
  });

  // Send gift email to recipient
  await sendGiftCourseEmail({
    recipientEmail: recipient.email,
    recipientName: `${recipient.first_name} ${recipient.last_name}`,
    senderName: `${sender.first_name} ${sender.last_name}`,
    courseTitle: course.title,
    courseDescription: course.description,
    courseId: course.id,
    personalMessage,
  });

  return {
    enrollment,
    recipient: {
      id: recipient.id,
      email: recipient.email,
      name: `${recipient.first_name} ${recipient.last_name}`,
    },
    course: {
      id: course.id,
      title: course.title,
    },
  };
};


