// Mentora Data Repositories Layer
// Strictly structured by domain to isolate Mongoose queries from business services.

// Auth Repositories
import userRepository from "./auth/user.repository.js";
import profileRepository from "./auth/profile.repository.js";
import tokenRepository from "./auth/token.repository.js";

// Course Repositories
import courseRepository from "./courses/course.repository.js";
import chapterRepository from "./courses/chapter.repository.js";
import lessonRepository from "./courses/lesson.repository.js";
import lessonMaterialRepository from "./courses/lessonMaterial.repository.js";
import quizRepository, { quizResultRepository } from "./courses/quiz.repository.js";
import ratingRepository from "./courses/rating.repository.js";
import enrollmentRepository from "./courses/enrollment.repository.js";
import certificateRepository from "./courses/certificate.repository.js";

// Category Repositories
import categoryRepository from "./categories/category.repository.js";
import subCategoryRepository from "./categories/subCategory.repository.js";

// Payment Repositories
import paymentRepository from "./payments/payment.repository.js";
import couponRepository from "./payments/coupon.repository.js";
import paymentLogRepository from "./payments/paymentLog.repository.js";

// Communication Repositories
import chatRoomRepository, {
  chatMessageRepository,
  chatParticipantRepository,
} from "./communication/chat.repository.js";
import notificationRepository from "./communication/notification.repository.js";

// Admin Repositories
import auditLogRepository from "./admin/auditLog.repository.js";
import enrollmentLogRepository from "./admin/enrollmentLog.repository.js";
import errorLogRepository from "./admin/errorLog.repository.js";
import moderationLogRepository from "./admin/moderationLog.repository.js";
import campaignRepository from "./admin/campaign.repository.js";
import featuredCourseRepository from "./admin/featuredCourse.repository.js";
import settingsRepository from "./admin/settings.repository.js";

// Report Repositories
import reportRepository from "./reports/report.repository.js";

export {
  // Auth
  userRepository,
  profileRepository,
  tokenRepository,
  // Courses
  courseRepository,
  chapterRepository,
  lessonRepository,
  lessonMaterialRepository,
  quizRepository,
  quizResultRepository,
  ratingRepository,
  enrollmentRepository,
  certificateRepository,
  // Categories
  categoryRepository,
  subCategoryRepository,
  // Payments
  paymentRepository,
  couponRepository,
  paymentLogRepository,
  // Communication
  chatRoomRepository,
  chatMessageRepository,
  chatParticipantRepository,
  notificationRepository,
  // Admin
  auditLogRepository,
  enrollmentLogRepository,
  errorLogRepository,
  moderationLogRepository,
  campaignRepository,
  featuredCourseRepository,
  settingsRepository,
  // Reports
  reportRepository,
};

export default {
  auth: {
    user: userRepository,
    profile: profileRepository,
    token: tokenRepository,
  },
  courses: {
    course: courseRepository,
    chapter: chapterRepository,
    lesson: lessonRepository,
    lessonMaterial: lessonMaterialRepository,
    quiz: quizRepository,
    quizResult: quizResultRepository,
    rating: ratingRepository,
    enrollment: enrollmentRepository,
    certificate: certificateRepository,
  },
  categories: {
    category: categoryRepository,
    subCategory: subCategoryRepository,
  },
  payments: {
    payment: paymentRepository,
    coupon: couponRepository,
    paymentLog: paymentLogRepository,
  },
  communication: {
    chatRoom: chatRoomRepository,
    chatMessage: chatMessageRepository,
    chatParticipant: chatParticipantRepository,
    notification: notificationRepository,
  },
  admin: {
    auditLog: auditLogRepository,
    enrollmentLog: enrollmentLogRepository,
    errorLog: errorLogRepository,
    moderationLog: moderationLogRepository,
    campaign: campaignRepository,
    featuredCourse: featuredCourseRepository,
    settings: settingsRepository,
  },
  reports: {
    report: reportRepository,
  },
};
