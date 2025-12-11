
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
import BatchUploadSession from "./admin/batchUploadSession.model.js";


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
  BatchUploadSession,
};




User.hasOne(Profile, { foreignKey: "user_id", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "user_id" });


Category.hasMany(SubCategory, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});
SubCategory.belongsTo(Category, { foreignKey: "category_id" });


User.hasMany(Course, { foreignKey: "instructor_id" });
Course.belongsTo(User, { foreignKey: "instructor_id", as: "Instructor" });


Category.hasMany(Course, { foreignKey: "category" });
Course.belongsTo(Category, { foreignKey: "category" });

SubCategory.hasMany(Course, { foreignKey: "subcategory" });
Course.belongsTo(SubCategory, { foreignKey: "subcategory" });

Course.hasMany(Chapter, { foreignKey: "course_id", onDelete: "CASCADE" });
Chapter.belongsTo(Course, { foreignKey: "course_id" });

Chapter.hasMany(Lesson, { foreignKey: "chapter_id", onDelete: "CASCADE" });
Lesson.belongsTo(Chapter, { foreignKey: "chapter_id" });


Lesson.hasMany(LessonMaterial, {
  foreignKey: "lesson_id",
  as: "materials",
  onDelete: "CASCADE",
});
LessonMaterial.belongsTo(Lesson, { foreignKey: "lesson_id" });

Chapter.hasMany(Quiz, { foreignKey: "chapter_id", onDelete: "CASCADE" });
Quiz.belongsTo(Chapter, { foreignKey: "chapter_id" });

Course.hasMany(Coupon, { foreignKey: "course_id", onDelete: "CASCADE" });
Coupon.belongsTo(Course, { foreignKey: "course_id" });


User.hasMany(Enrollment, { foreignKey: "student_id" });
Enrollment.belongsTo(User, { foreignKey: "student_id" });

Course.hasMany(Enrollment, { foreignKey: "course_id", onDelete: "CASCADE" });
Enrollment.belongsTo(Course, { foreignKey: "course_id" });


Quiz.hasMany(QuizResult, { foreignKey: "quiz_id" });
QuizResult.belongsTo(Quiz, { foreignKey: "quiz_id" });

User.hasMany(QuizResult, { foreignKey: "student_id" });
QuizResult.belongsTo(User, { foreignKey: "student_id" });


User.hasMany(Payment, { foreignKey: "user_id" });
Payment.belongsTo(User, { foreignKey: "user_id", as: "Student" });

Course.hasMany(Payment, { foreignKey: "course_id", onDelete: "CASCADE" });
Payment.belongsTo(Course, { foreignKey: "course_id" });


User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });


Course.hasOne(ChatRoom, { foreignKey: "course_id" });
ChatRoom.belongsTo(Course, { foreignKey: "course_id" });

ChatRoom.hasMany(ChatMessage, { foreignKey: "room_id" });
ChatMessage.belongsTo(ChatRoom, { foreignKey: "room_id" });

User.hasMany(ChatMessage, { foreignKey: "sender_id" });
ChatMessage.belongsTo(User, { foreignKey: "sender_id" });


User.hasMany(Ratings, { foreignKey: "student_id" });
Ratings.belongsTo(User, { foreignKey: "student_id" });

Course.hasMany(Ratings, { foreignKey: "course_id", onDelete: "CASCADE" });
Ratings.belongsTo(Course, { foreignKey: "course_id" });


User.hasMany(Certificate, { foreignKey: "student_id" });
Certificate.belongsTo(User, { foreignKey: "student_id", as: "student" });

Course.hasMany(Certificate, { foreignKey: "course_id", onDelete: "CASCADE" });
Certificate.belongsTo(Course, { foreignKey: "course_id" });


ChatRoom.hasMany(ChatParticipant, {
  foreignKey: "room_id",
  onDelete: "CASCADE",
});
ChatParticipant.belongsTo(ChatRoom, { foreignKey: "room_id" });

User.hasMany(ChatParticipant, { foreignKey: "user_id" });
ChatParticipant.belongsTo(User, { foreignKey: "user_id" });


Course.hasMany(BatchUploadSession, {
  foreignKey: "course_id",
  onDelete: "CASCADE",
});
BatchUploadSession.belongsTo(Course, { foreignKey: "course_id" });

User.hasMany(BatchUploadSession, { foreignKey: "instructor_id" });
BatchUploadSession.belongsTo(User, { foreignKey: "instructor_id" });


User.hasMany(Report, { foreignKey: "reported_by", as: "ReportedReports" });
Report.belongsTo(User, { foreignKey: "reported_by", as: "Reporter" });

User.hasMany(Report, { foreignKey: "reviewed_by", as: "ReviewedReports" });
Report.belongsTo(User, { foreignKey: "reviewed_by", as: "Reviewer" });


User.hasMany(AuditLog, { foreignKey: "admin_id" });
AuditLog.belongsTo(User, { foreignKey: "admin_id", as: "Admin" });


User.hasMany(PaymentLog, { foreignKey: "student_id" });
PaymentLog.belongsTo(User, { foreignKey: "student_id", as: "Student" });

Course.hasMany(PaymentLog, { foreignKey: "course_id" });
PaymentLog.belongsTo(Course, { foreignKey: "course_id" });


Enrollment.hasMany(EnrollmentLog, { foreignKey: "enrollment_id" });
EnrollmentLog.belongsTo(Enrollment, { foreignKey: "enrollment_id" });

User.hasMany(EnrollmentLog, { foreignKey: "student_id" });
EnrollmentLog.belongsTo(User, { foreignKey: "student_id", as: "Student" });

Course.hasMany(EnrollmentLog, { foreignKey: "course_id" });
EnrollmentLog.belongsTo(Course, { foreignKey: "course_id" });


User.hasMany(ModerationLog, { foreignKey: "moderator_id" });
ModerationLog.belongsTo(User, { foreignKey: "moderator_id", as: "Moderator" });


Notification.hasMany(NotificationLog, { foreignKey: "notification_id" });
NotificationLog.belongsTo(Notification, { foreignKey: "notification_id" });

User.hasMany(NotificationLog, { foreignKey: "sender_id" });
NotificationLog.belongsTo(User, { foreignKey: "sender_id", as: "Sender" });


User.hasMany(ErrorLog, { foreignKey: "user_id" });
ErrorLog.belongsTo(User, { foreignKey: "user_id" });


User.hasMany(Campaign, { foreignKey: "created_by" });
Campaign.belongsTo(User, { foreignKey: "created_by", as: "Creator" });


Course.hasMany(FeaturedCourse, { foreignKey: "course_id" });
FeaturedCourse.belongsTo(Course, { foreignKey: "course_id" });

Campaign.hasMany(FeaturedCourse, { foreignKey: "campaign_id" });
FeaturedCourse.belongsTo(Campaign, { foreignKey: "campaign_id" });

export default models;
