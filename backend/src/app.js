import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { authenticate, authorize } from "./middlewares/auth.middleware.js";
import { generalLimiter } from "./rate-limiters/general.limiter.js";
import auditLogMiddleware from "./middlewares/auditLog.middleware.js";
import authRoutes from "./routes/auth/auth.routes.js";
import courseRoutes from "./routes/courses/course.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import chapterRoutes from "./routes/courses/chapter.routes.js";
import lessonRoutes from "./routes/courses/lesson.routes.js";
import lessonMaterialRoutes from "./routes/courses/lessonMaterial.routes.js";
import quizRoutes from "./routes/courses/quiz.routes.js";
import reviewRoutes from "./routes/courses/review.routes.js";
import enrollmentRoutes from "./routes/courses/enrollment.routes.js";
import categoryRoutes from "./routes/categories/category.routes.js";
import subCategoryRoutes from "./routes/categories/subCategory.routes.js";
import userRoutes from "./routes/users/user.routes.js";
import profileRoutes from "./routes/users/profile.routes.js";
import certificateRoutes from "./routes/users/certificate.routes.js";
import paymentRoutes from "./routes/payments/payment.routes.js";
import couponRoutes from "./routes/courses/coupon.routes.js";
import chatRoutes from "./routes/communication/chat.routes.js";
import notificationRoutes from "./routes/communication/notification.routes.js";
import cloudinaryRoutes from "./routes/media/cloudinary.routes.js";
import materialUploadRoutes from "./routes/media/materialUpload.routes.js";
import aiRoutes from "./routes/ai/ai.routes.js";
import reportRoutes from "./routes/reports/report.routes.js";
import adminAnalyticsRoutes from "./routes/admin/analytics.routes.js";
import adminCategoriesRoutes from "./routes/admin/categories.routes.js";
import adminCouponsRoutes from "./routes/admin/coupons.routes.js";
import adminCoursesRoutes from "./routes/admin/courses.routes.js";
import adminFinancialRoutes from "./routes/admin/financial.routes.js";
import adminInstructorsRoutes from "./routes/admin/instructors.routes.js";
import adminLogsRoutes from "./routes/admin/logs.routes.js";
import adminNotificationsRoutes from "./routes/admin/notifications.routes.js";
import adminReportsRoutes from "./routes/admin/reports.routes.js";
import adminSettingsRoutes from "./routes/admin/settings.routes.js";
import adminUsersRoutes from "./routes/admin/users.routes.js";
import adminPlatformAnalyticsRoutes from "./routes/admin/platform-analytics.routes.js";
import instructorCoursesRoutes from "./routes/instructor/courses.routes.js";
import instructorAnalyticsRoutes from "./routes/instructor/analytics.routes.js";
import { setupChatSocket } from "./sockets/chat.socket.js";
import { connectRedis } from "./config/redis.js";
import { initCronJobs } from "./cron/init.cron.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply general rate limiter to all API routes
app.use("/api", generalLimiter);

// Apply audit logging middleware to all API routes (logs admin actions after auth)
app.use("/api", auditLogMiddleware);


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS API is running",
    version: "1.0.0",
  });
});

app.use(
  "/api/admin/analytics",
  authenticate,
  authorize("admin"),
  adminAnalyticsRoutes
);
app.use(
  "/api/admin/categories",
  authenticate,
  authorize("admin"),
  adminCategoriesRoutes
);
app.use(
  "/api/admin/coupons",
  authenticate,
  authorize("admin"),
  adminCouponsRoutes
);
app.use(
  "/api/admin/courses",
  authenticate,
  authorize("admin"),
  adminCoursesRoutes
);
app.use(
  "/api/admin/financial",
  authenticate,
  authorize("admin"),
  adminFinancialRoutes
);
app.use(
  "/api/admin/instructors",
  authenticate,
  authorize("admin"),
  adminInstructorsRoutes
);
app.use("/api/admin/logs", authenticate, authorize("admin"), adminLogsRoutes);

app.use(
  "/api/admin/notifications",
  authenticate,
  authorize("admin"),
  adminNotificationsRoutes
);
app.use(
  "/api/admin/reports",
  authenticate,
  authorize("admin"),
  adminReportsRoutes
);
app.use(
  "/api/admin/settings",
  authenticate,
  authorize("admin"),
  adminSettingsRoutes
);
app.use("/api/admin/users", authenticate, authorize("admin"), adminUsersRoutes);
app.use(
  "/api/admin/platform-analytics",
  authenticate,
  authorize("admin"),
  adminPlatformAnalyticsRoutes
);

app.use("/api/instructor/courses", instructorCoursesRoutes);
app.use("/api/instructor/analytics", instructorAnalyticsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/courses", courseRoutes);

app.use("/api/instructor", instructorRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/materials", materialUploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", lessonMaterialRoutes);

app.use(notFound);
app.use(errorHandler);

connectRedis();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupChatSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initCronJobs();
});

export default app;
