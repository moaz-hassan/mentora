import User from "./user.model.js";
import Profile from "./profile.model.js";
import Course from "./course.model.js";
import Lesson from "./lesson.model.js";
import Enrollment from "./enrollment.model.js";
import Quiz from "./quiz.model.js";
import QuizResult from "./quizResult.model.js";
import Payment from "./payment.model.js";
import Notification from "./notification.model.js";
import ChatRoom from "./chatRoom.model.js";
import ChatMessage from "./chatMessage.model.js";
import ChatParticipant from "./chatParticipant.model.js";
import CourseReview from "./courseReview.model.js";
import Certificate from "./certificate.model.js";
import Chapter from "./chapter.model.js";
import Coupon from "./coupon.model.js";
import Token from "./token.model.js";
import BatchUploadSession from "./batchUploadSession.model.js";
import Category from "./category.model.js";
import SubCategory from "./subCategory.model.js";

// Initialize models object
const models = {
  User,
  Profile,
  Course,
  Lesson,
  Enrollment,
  Quiz,
  QuizResult,
  Payment,
  Notification,
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  CourseReview,
  Certificate,
  Chapter,
  Coupon,
  Token,
  BatchUploadSession,
  Category,
  SubCategory,
};

// Define associations

// USERS & PROFILES
User.hasOne(Profile, { foreignKey: "user_id", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "user_id" });

// CATEGORY & SUBCATEGORY
Category.hasMany(SubCategory, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});
SubCategory.belongsTo(Category, { foreignKey: "category_id" });

// COURSES & LESSONS
User.hasMany(Course, { foreignKey: "instructor_id" });
Course.belongsTo(User, { foreignKey: "instructor_id" });

// CATEGORY & COURSE RELATIONSHIPS
Category.hasMany(Course, { foreignKey: "category_id" });
Course.belongsTo(Category, { foreignKey: "category_id" });

SubCategory.hasMany(Course, { foreignKey: "subcategory_id" });
Course.belongsTo(SubCategory, { foreignKey: "subcategory_id" });

Course.hasMany(Chapter, { foreignKey: "course_id", onDelete: "CASCADE" });
Chapter.belongsTo(Course, { foreignKey: "course_id" });

Chapter.hasMany(Lesson, { foreignKey: "chapter_id", onDelete: "CASCADE" });
Lesson.belongsTo(Chapter, { foreignKey: "chapter_id" });

Chapter.hasMany(Quiz, { foreignKey: "chapter_id", onDelete: "CASCADE" });
Quiz.belongsTo(Chapter, { foreignKey: "chapter_id" });

Course.hasMany(Coupon, { foreignKey: "course_id", onDelete: "CASCADE" });
Coupon.belongsTo(Course, { foreignKey: "course_id" });

// ENROLLMENTS
User.hasMany(Enrollment, { foreignKey: "student_id" });
Enrollment.belongsTo(User, { foreignKey: "student_id" });

Course.hasMany(Enrollment, { foreignKey: "course_id", onDelete: "CASCADE" });
Enrollment.belongsTo(Course, { foreignKey: "course_id" });

// QUIZ RESULTS
Quiz.hasMany(QuizResult, { foreignKey: "quiz_id" });
QuizResult.belongsTo(Quiz, { foreignKey: "quiz_id" });

User.hasMany(QuizResult, { foreignKey: "student_id" });
QuizResult.belongsTo(User, { foreignKey: "student_id" });

// PAYMENTS
User.hasMany(Payment, { foreignKey: "user_id" });
Payment.belongsTo(User, { foreignKey: "user_id" });

Course.hasMany(Payment, { foreignKey: "course_id", onDelete: "CASCADE" });
Payment.belongsTo(Course, { foreignKey: "course_id" });

// NOTIFICATIONS
User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

// CHAT SYSTEM
Course.hasOne(ChatRoom, { foreignKey: "course_id" });
ChatRoom.belongsTo(Course, { foreignKey: "course_id" });

ChatRoom.hasMany(ChatMessage, { foreignKey: "room_id" });
ChatMessage.belongsTo(ChatRoom, { foreignKey: "room_id" });

User.hasMany(ChatMessage, { foreignKey: "sender_id" });
ChatMessage.belongsTo(User, { foreignKey: "sender_id" });

// COURSE REVIEWS
User.hasMany(CourseReview, { foreignKey: "student_id" });
CourseReview.belongsTo(User, { foreignKey: "student_id" });

Course.hasMany(CourseReview, { foreignKey: "course_id", onDelete: "CASCADE" });
CourseReview.belongsTo(Course, { foreignKey: "course_id" });

// CERTIFICATES
User.hasMany(Certificate, { foreignKey: "student_id" });
Certificate.belongsTo(User, { foreignKey: "student_id" });

Course.hasMany(Certificate, { foreignKey: "course_id", onDelete: "CASCADE" });
Certificate.belongsTo(Course, { foreignKey: "course_id" });

// CHAT PARTICIPANTS
ChatRoom.hasMany(ChatParticipant, {
  foreignKey: "room_id",
  onDelete: "CASCADE",
});
ChatParticipant.belongsTo(ChatRoom, { foreignKey: "room_id" });

User.hasMany(ChatParticipant, { foreignKey: "user_id" });
ChatParticipant.belongsTo(User, { foreignKey: "user_id" });

// BATCH UPLOAD SESSIONS
Course.hasMany(BatchUploadSession, {
  foreignKey: "course_id",
  onDelete: "CASCADE",
});
BatchUploadSession.belongsTo(Course, { foreignKey: "course_id" });

User.hasMany(BatchUploadSession, { foreignKey: "instructor_id" });
BatchUploadSession.belongsTo(User, { foreignKey: "instructor_id" });

export default models;
