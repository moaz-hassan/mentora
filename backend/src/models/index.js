import User from "./auth/user.model.js";
import Profile from "./auth/profile.model.js";
import Token from "./auth/token.model.js";

import Course from "./courses/course.model.js";
import Chapter from "./courses/chapter.model.js";
import Lesson from "./courses/lesson.model.js";
import LessonMaterial from "./courses/lessonMaterial.model.js";
import Quiz from "./courses/quiz.model.js";
import QuizResult from "./courses/quizResult.model.js";
import Ratings from "./courses/Ratings.model.js";
import Enrollment from "./courses/enrollment.model.js";
import Certificate from "./courses/certificate.model.js";

import Category from "./categories/category.model.js";
import SubCategory from "./categories/subCategory.model.js";

import Payment from "./payments/payment.model.js";
import PaymentLog from "./payments/paymentLog.model.js";
import Coupon from "./payments/coupon.model.js";

import ChatRoom from "./communication/chatRoom.model.js";
import ChatMessage from "./communication/chatMessage.model.js";
import ChatParticipant from "./communication/chatParticipant.model.js";
import Notification from "./communication/notification.model.js";
import NotificationLog from "./communication/notificationLog.model.js";

import Report from "./reports/report.model.js";

import AuditLog from "./admin/auditLog.model.js";
import EnrollmentLog from "./admin/enrollmentLog.model.js";
import ModerationLog from "./admin/moderationLog.model.js";
import ErrorLog from "./admin/errorLog.model.js";
import Settings from "./admin/settings.model.js";
import Campaign from "./admin/campaign.model.js";
import FeaturedCourse from "./admin/featuredCourse.model.js";

const models = {
  User,
  Profile,
  Token,
  Course,
  Chapter,
  Lesson,
  LessonMaterial,
  Quiz,
  QuizResult,
  Ratings,
  Enrollment,
  Certificate,
  Category,
  SubCategory,
  Payment,
  PaymentLog,
  Coupon,
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  Notification,
  NotificationLog,
  Report,
  AuditLog,
  EnrollmentLog,
  ModerationLog,
  ErrorLog,
  Settings,
  Campaign,
  FeaturedCourse,
};

export {
  User,
  Profile,
  Token,
  Course,
  Chapter,
  Lesson,
  LessonMaterial,
  Quiz,
  QuizResult,
  Ratings,
  Enrollment,
  Certificate,
  Category,
  SubCategory,
  Payment,
  PaymentLog,
  Coupon,
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  Notification,
  NotificationLog,
  Report,
  AuditLog,
  EnrollmentLog,
  ModerationLog,
  ErrorLog,
  Settings,
  Campaign,
  FeaturedCourse,
};

export default models;
