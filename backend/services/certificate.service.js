/**
 * Certificate Service
 * Purpose: Handle certificate-related business logic
 * Includes: CRUD operations for certificates
 */

import models from "../models/index.model.js";

const { Certificate, Course, User } = models;

/**
 * Get all certificates with optional filters
 * @param {Object} filters - Query filters (student_id, course_id, verified)
 * @returns {Array} List of certificates
 */
export const getAllCertificates = async (filters = {}) => {
  const where = {};

  if (filters.student_id) where.student_id = filters.student_id;
  if (filters.course_id) where.course_id = filters.course_id;
  if (filters.verified !== undefined) where.verified = filters.verified;

  const certificates = await Certificate.findAll({
    where,
    include: [
      { model: User, attributes: ["id", "full_name", "email"] },
      { model: Course, attributes: ["id", "title"] },
    ],
    order: [["issued_at", "DESC"]],
  });

  return certificates;
};

/**
 * Get certificate by ID
 * @param {string} certificateId - Certificate ID
 * @returns {Object} Certificate object
 */
export const getCertificateById = async (certificateId) => {
  const certificate = await Certificate.findByPk(certificateId, {
    include: [
      { model: User, attributes: ["id", "full_name", "email"] },
      { model: Course, attributes: ["id", "title"] },
    ],
  });

  if (!certificate) {
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    throw error;
  }

  return certificate;
};

/**
 * Create a new certificate
 * @param {Object} certificateData - Certificate data
 * @returns {Object} Created certificate
 */
export const createCertificate = async (certificateData) => {
  const { student_id, course_id, certificate_url, verified } = certificateData;

  // Verify student exists
  const student = await User.findByPk(student_id);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify course exists
  const course = await Course.findByPk(course_id);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    where: { student_id, course_id },
  });

  if (existingCertificate) {
    const error = new Error("Certificate already exists for this student and course");
    error.statusCode = 400;
    throw error;
  }

  const certificate = await Certificate.create({
    student_id,
    course_id,
    certificate_url,
    verified: verified || false,
  });

  return certificate;
};

/**
 * Update certificate
 * @param {string} certificateId - Certificate ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated certificate
 */
export const updateCertificate = async (certificateId, updateData) => {
  const certificate = await Certificate.findByPk(certificateId);

  if (!certificate) {
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    throw error;
  }

  await certificate.update(updateData);

  return certificate;
};

/**
 * Delete certificate
 * @param {string} certificateId - Certificate ID
 * @returns {Object} Success message
 */
export const deleteCertificate = async (certificateId) => {
  const certificate = await Certificate.findByPk(certificateId);

  if (!certificate) {
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    throw error;
  }

  await certificate.destroy();

  return { message: "Certificate deleted successfully" };
};

/**
 * Check if course is completed and eligible for certificate
 */
export const checkCourseCompletion = async (studentId, courseId) => {
  const { Enrollment, Chapter, Lesson, Quiz, QuizResult } = models;

  // Get enrollment
  const enrollment = await Enrollment.findOne({
    where: { student_id: studentId, course_id: courseId },
  });

  if (!enrollment) {
    return { completed: false, reason: "Not enrolled in course" };
  }

  // Get course structure
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: Chapter,
        where: { status: "approved" },
        required: false,
        include: [
          {
            model: Lesson,
          },
          {
            model: Quiz,
          },
        ],
      },
    ],
  });

  if (!course) {
    return { completed: false, reason: "Course not found" };
  }

  const progress = enrollment.progress || {};
  const completedLessons = progress.completedLessons || [];
  const completedQuizzes = progress.completedQuizzes || [];

  // Count total lessons and quizzes
  let totalLessons = 0;
  let totalQuizzes = 0;
  const quizIds = [];

  if (course.Chapters) {
    course.Chapters.forEach((chapter) => {
      totalLessons += chapter.Lessons ? chapter.Lessons.length : 0;
      if (chapter.Quizzes) {
        chapter.Quizzes.forEach((quiz) => {
          totalQuizzes++;
          quizIds.push(quiz.id);
        });
      }
    });
  }

  // Check if all lessons are completed
  if (completedLessons.length < totalLessons) {
    return {
      completed: false,
      reason: `Only ${completedLessons.length} of ${totalLessons} lessons completed`,
    };
  }

  // Check if all quizzes are completed with passing scores
  if (totalQuizzes > 0) {
    const quizResults = await QuizResult.findAll({
      where: {
        student_id: studentId,
        quiz_id: quizIds,
      },
    });

    // Check if all quizzes have results
    if (quizResults.length < totalQuizzes) {
      return {
        completed: false,
        reason: `Only ${quizResults.length} of ${totalQuizzes} quizzes completed`,
      };
    }

    // Check if all quizzes have passing scores (>= 70%)
    const failedQuizzes = quizResults.filter((result) => result.score < 70);
    if (failedQuizzes.length > 0) {
      return {
        completed: false,
        reason: `${failedQuizzes.length} quiz(es) not passed (score < 70%)`,
      };
    }
  }

  return { completed: true };
};

/**
 * Generate certificate for completed course
 * Automatically called when course is completed
 */
export const generateCertificate = async (studentId, courseId) => {
  // Check if course is completed
  const completionCheck = await checkCourseCompletion(studentId, courseId);

  if (!completionCheck.completed) {
    const error = new Error(`Cannot generate certificate: ${completionCheck.reason}`);
    error.statusCode = 400;
    throw error;
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    where: { student_id: studentId, course_id: courseId },
  });

  if (existingCertificate) {
    return existingCertificate;
  }

  // Get student and course info
  const student = await User.findByPk(studentId);
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name"],
      },
    ],
  });

  // Generate unique certificate ID
  const certificateId = `CERT-${Date.now()}-${studentId.substring(0, 8)}`;

  // In a real implementation, you would generate a PDF here
  // For now, we'll just store the certificate URL as a placeholder
  const certificateUrl = `/certificates/${certificateId}.pdf`;

  // Create certificate record
  const certificate = await Certificate.create({
    student_id: studentId,
    course_id: courseId,
    certificate_url: certificateUrl,
    certificate_id: certificateId,
    issued_at: new Date(),
    verified: true,
  });

  // Create notification for student
  const { createNotification } = await import("./notification.service.js");
  await createNotification({
    user_id: studentId,
    type: "certificate_issued",
    title: "Certificate Issued",
    message: `Congratulations! You've earned a certificate for completing "${course.title}"`,
    related_id: certificate.id,
    related_type: "certificate",
  });

  return certificate;
};

/**
 * Generate certificate PDF
 * This is a placeholder - in production, use a PDF library like PDFKit or Puppeteer
 */
export const generateCertificatePDF = async (certificateId) => {
  const certificate = await Certificate.findByPk(certificateId, {
    include: [
      { model: User, attributes: ["id", "first_name", "last_name", "email"] },
      {
        model: Course,
        attributes: ["id", "title"],
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      },
    ],
  });

  if (!certificate) {
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    throw error;
  }

  // In production, generate actual PDF here
  // For now, return certificate data
  const pdfData = {
    certificate_id: certificate.certificate_id,
    student_name: `${certificate.User.first_name} ${certificate.User.last_name}`,
    course_title: certificate.Course.title,
    instructor_name: `${certificate.Course.User.first_name} ${certificate.Course.User.last_name}`,
    completion_date: certificate.issued_at,
    verified: certificate.verified,
  };

  return pdfData;
};

/**
 * Verify certificate by certificate ID
 */
export const verifyCertificate = async (certificateId) => {
  const certificate = await Certificate.findOne({
    where: { certificate_id: certificateId },
    include: [
      { model: User, attributes: ["id", "first_name", "last_name", "email"] },
      {
        model: Course,
        attributes: ["id", "title"],
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      },
    ],
  });

  if (!certificate) {
    return {
      valid: false,
      message: "Certificate not found",
    };
  }

  return {
    valid: true,
    certificate: {
      certificate_id: certificate.certificate_id,
      student_name: `${certificate.User.first_name} ${certificate.User.last_name}`,
      course_title: certificate.Course.title,
      instructor_name: `${certificate.Course.User.first_name} ${certificate.Course.User.last_name}`,
      completion_date: certificate.issued_at,
      verified: certificate.verified,
    },
  };
};

/**
 * Get student certificates
 */
export const getStudentCertificates = async (studentId) => {
  const certificates = await Certificate.findAll({
    where: { student_id: studentId },
    include: [
      {
        model: Course,
        attributes: ["id", "title", "thumbnail_url"],
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      },
    ],
    order: [["issued_at", "DESC"]],
  });

  return certificates.map((cert) => ({
    id: cert.id,
    certificate_id: cert.certificate_id,
    certificate_url: cert.certificate_url,
    issued_at: cert.issued_at,
    verified: cert.verified,
    course: {
      id: cert.Course.id,
      title: cert.Course.title,
      thumbnail_url: cert.Course.thumbnail_url,
      instructor_name: `${cert.Course.User.first_name} ${cert.Course.User.last_name}`,
    },
  }));
};
