import enrollmentRepository from "../../repositories/courses/enrollment.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";
import notificationRepository from "../../repositories/communication/notification.repository.js";
import lessonRepository from "../../repositories/courses/lesson.repository.js";
import chapterRepository from "../../repositories/courses/chapter.repository.js";
import { quizRepository } from "../../repositories/courses/quiz.repository.js";
import userRepository from "../../repositories/auth/user.repository.js";
import { chatRoomRepository, chatParticipantRepository } from "../../repositories/communication/chat.repository.js";
import { updateProgress, completeLesson } from "./progress.service.js";
import Course from "../../models/courses/course.model.js";
import User from "../../models/auth/user.model.js";
import LessonMaterial from "../../models/courses/lessonMaterial.model.js";

export { updateProgress, completeLesson };

export const getAllEnrollments = async (userId) => {
  return await enrollmentRepository.findByStudentId(userId);
};

export const checkEnrollment = async (courseId, studentId) => {
  const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
  return !!enrollment;
};

export const getEnrollmentById = async (enrollmentId) => {
  const enrollment = await enrollmentRepository.findById(enrollmentId);

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  const courseId = enrollment.course_id;
  const studentId = enrollment.student_id;
  let chatMembership = { isMember: false, roomId: null };

  if (courseId && studentId) {
    const chatRoom = await chatRoomRepository.findByCourseId(courseId, "group");

    if (chatRoom) {
      const participant = await chatParticipantRepository.findOne({
        room_id: chatRoom._id.toString(),
        user_id: studentId,
        is_active: true,
      });
      chatMembership = {
        isMember: !!participant,
        roomId: participant ? chatRoom._id.toString() : null,
      };
    }
  }

  const enrollmentData = enrollment.toJSON();
  enrollmentData.chatMembership = chatMembership;

  return enrollmentData;
};

export const createEnrollment = async (course_id, studentId) => {
  const course = await Course.findById(course_id)
    .populate("Instructor", "id first_name last_name")
    .exec();

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const existingEnrollment = await enrollmentRepository.findByStudentAndCourse(studentId, course_id);

  if (existingEnrollment) {
    const error = new Error("Already enrolled in this course");
    error.statusCode = 400;
    throw error;
  }

  const student = await User.findById(studentId).select("first_name last_name email").exec();

  const enrollment = await enrollmentRepository.create({
    student_id: studentId,
    course_id,
  });

  await notificationRepository.create({
    user_id: studentId,
    type: "new_enrollment",
    title: "Enrollment Confirmed",
    message: `You have successfully enrolled in "${course.title}". Start learning now!`,
    related_id: course._id.toString(),
    related_type: "course",
    is_read: false,
  });

  try {
    const { sendEnrollmentConfirmationEmail } = await import("../auth/email.service.js");
    const instructorName = course.Instructor
      ? `${course.Instructor.first_name} ${course.Instructor.last_name}`
      : "Instructor";

    await sendEnrollmentConfirmationEmail({
      studentEmail: student.email,
      studentName: `${student.first_name} ${student.last_name}`,
      courseTitle: course.title,
      courseId: course._id.toString(),
      instructorName,
    });
  } catch (emailError) {
    console.error("Failed to send enrollment confirmation email:", emailError);
  }

  return enrollment;
};

export const getProgress = async (enrollmentId, studentId) => {
  const enrollment = await enrollmentRepository.findOne({
    _id: enrollmentId,
    student_id: studentId,
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  return enrollment.progress;
};

export const verifyEnrollmentAndUpdateProgress = async (enrollmentId, lessonId, studentId) => {
  const enrollment = await enrollmentRepository.findOne({
    _id: enrollmentId,
    student_id: studentId,
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found or access denied");
    error.statusCode = 403;
    throw error;
  }

  const lesson = await lessonRepository.findByIdRaw(lessonId);

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(lesson.chapter_id);

  if (!chapter || chapter.course_id !== enrollment.course_id) {
    const error = new Error("Lesson does not belong to enrolled course");
    error.statusCode = 403;
    throw error;
  }

  const progress = enrollment.progress || {};
  progress.currentLessonId = lessonId;
  progress.currentChapterId = lesson.chapter_id;
  progress.lastAccessed = new Date();
  await enrollmentRepository.updateProgressById(enrollmentId, progress);

  return { hasAccess: true };
};

export const getLessonContent = async (lessonId) => {
  const lesson = await lessonRepository.findByIdRaw(lessonId);

  if (!lesson) return null;

  const materials = await LessonMaterial.find({ lesson_id: lessonId })
    .sort({ order_number: 1 })
    .select("id filename url file_type file_size order_number")
    .exec();

  return {
    id: lesson._id.toString(),
    title: lesson.title,
    lesson_type: lesson.lesson_type,
    video_url: lesson.video_url,
    video_public_id: lesson.video_public_id,
    hls_url: lesson.hls_url,
    content: lesson.content,
    duration: lesson.duration,
    order_number: lesson.order_number,
    chapter_id: lesson.chapter_id,
    materials: materials || [],
  };
};

export const getQuizDetail = async (enrollmentId, quizId, studentId) => {
  const enrollment = await enrollmentRepository.findOne({
    _id: enrollmentId,
    student_id: studentId,
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found or access denied");
    error.statusCode = 403;
    throw error;
  }

  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await chapterRepository.findByIdRaw(quiz.chapter_id);
  if (!chapter || chapter.course_id !== enrollment.course_id) {
    const error = new Error("Quiz does not belong to enrolled course");
    error.statusCode = 403;
    throw error;
  }

  const sanitizedQuestions = (quiz.questions || []).map((q) => {
    const { correctAnswer, ...rest } = q;
    return rest;
  });

  return {
    id: quiz._id.toString(),
    title: quiz.title,
    description: quiz.description,
    order_number: quiz.order_number,
    chapter_id: quiz.chapter_id,
    questions: sanitizedQuestions,
  };
};

export const submitQuiz = async (enrollmentId, quizId, studentId, answers) => {
  const enrollment = await enrollmentRepository.findOne({
    _id: enrollmentId,
    student_id: studentId,
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found or access denied");
    error.statusCode = 403;
    throw error;
  }

  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const questions = quiz.questions || [];
  let correctCount = 0;
  const results = {};

  questions.forEach((question, index) => {
    const rawUserAnswer = answers[index] || answers[String(index)];
    const userAnswer = rawUserAnswer ? String(rawUserAnswer).trim() : null;
    const correctVal = question.correctAnswer || question.answer;
    const correctAnswer = correctVal ? String(correctVal).trim() : null;
    const isCorrect = userAnswer && correctAnswer && userAnswer === correctAnswer;

    if (isCorrect) {
      correctCount++;
    }

    results[index] = {
      isCorrect,
      correctAnswer: question.correctAnswer,
    };

    console.log(`Question ${index}: User Answer "${userAnswer}" vs Correct "${correctAnswer}" -> ${isCorrect}`);
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 70;

  let updatedProgress = null;
  if (passed) {
    const updatedEnrollment = await updateProgress(enrollmentId, studentId, {
      completedQuizId: quizId,
      quizScore: score,
    });
    updatedProgress = updatedEnrollment?.progress;
  }

  return {
    score,
    passed,
    correctCount,
    totalQuestions: questions.length,
    results,
    progress: updatedProgress,
  };
};

export const giftCourse = async (courseId, senderId, recipientEmail, personalMessage = "") => {
  const { sendGiftCourseEmail } = await import("../auth/email.service.js");

  const course = await Course.findById(courseId).exec();
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const recipient = await User.findOne({ email: recipientEmail }).exec();
  if (!recipient) {
    const error = new Error("Recipient not found. They must be a registered user.");
    error.statusCode = 404;
    throw error;
  }

  if (recipient._id.toString() === senderId) {
    const error = new Error("You cannot gift a course to yourself");
    error.statusCode = 400;
    throw error;
  }

  const existingEnrollment = await enrollmentRepository.findByStudentAndCourse(
    recipient._id.toString(),
    courseId
  );

  if (existingEnrollment) {
    const error = new Error("Recipient is already enrolled in this course");
    error.statusCode = 400;
    throw error;
  }

  const sender = await User.findById(senderId).exec();
  if (!sender) {
    const error = new Error("Sender not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await enrollmentRepository.create({
    student_id: recipient._id.toString(),
    course_id: courseId,
    gifted_by: senderId,
  });

  await sendGiftCourseEmail({
    recipientEmail: recipient.email,
    recipientName: `${recipient.first_name} ${recipient.last_name}`,
    senderName: `${sender.first_name} ${sender.last_name}`,
    courseTitle: course.title,
    courseDescription: course.description,
    courseId: course._id.toString(),
    personalMessage,
  });

  return {
    enrollment,
    recipient: {
      id: recipient._id.toString(),
      email: recipient.email,
      name: `${recipient.first_name} ${recipient.last_name}`,
    },
    course: {
      id: course._id.toString(),
      title: course.title,
    },
  };
};

export default {
  getAllEnrollments,
  checkEnrollment,
  getEnrollmentById,
  createEnrollment,
  getProgress,
  verifyEnrollmentAndUpdateProgress,
  getLessonContent,
  getQuizDetail,
  submitQuiz,
  giftCourse,
  updateProgress,
  completeLesson,
};
