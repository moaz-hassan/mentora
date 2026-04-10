**Mentora Backend — Features Reference**

**Purpose**: Single-file developer reference that lists every major backend feature, integrations, background jobs, configuration, and where to find the implementation in the codebase.

**Scope**: Authentication, users/profiles, courses/content, media & storage, payments & coupons, chat & notifications, AI features, admin tools, cron/jobs, queues/workers, security & rate limiting, environment variables, and deployment notes.

**How to use**: Each feature below shows a brief description and the primary code locations (folders/files) to inspect for implementation details.

**Authentication & Authorization**
- **Feature**: Email-based registration, login, JWT tokens, email verification, password reset, resend verification.
- **Description**: Users register (student/instructor/admin), receive verification emails, login returns JWT signed with `JWT_SECRET` and `JWT_EXPIRES_IN`. Middleware enforces authentication and role-based authorization.
- **Key files**: src/routes/auth, src/controllers/auth, src/services/auth, src/middlewares/auth.middleware.js, src/services/auth/token.service.js

**Users & Profiles**
- **Feature**: User CRUD, profile model, avatar handling, instructor application flow, account activation/deactivation.
- **Description**: Profiles created on registration; instructors can apply/be promoted; user state includes is_active and is_email_verified flags used by auth middleware.
- **Key files**: src/routes/users, src/controllers/users, src/services/users, src/models/* (User, Profile)

**Courses (Authoring & Management)**
- **Feature**: Create/edit courses (drafts), publish/approve workflow, pricing (free/paid), course metadata, featured courses, course moderation.
- **Description**: Instructors create course drafts, add metadata, submit for admin approval; admins approve/reject with feedback emails.
- **Key files**: src/routes/courses, src/controllers/courses/course.controller.js, src/services/courses, src/validators/courses

**Course Content: Chapters, Lessons, Materials**
- **Feature**: Chapter & lesson management, lesson materials, video & file attachments, ordering and progress tracking.
- **Description**: Lessons support video (Cloudinary signed upload) and downloadable materials (Cloudinary or Supabase). Progress is tracked per enrollment and used to grant certificates.
- **Key files**: src/routes/chapters, src/routes/lessons, src/routes/materials, src/controllers/courses/lessonMaterial.controller.js, src/utils/supabaseStorage.util.js

**Quizzes & Reviews**
- **Feature**: Create quizzes, question types, scoring, store quiz results; course reviews and ratings by enrolled students.
- **Key files**: src/routes/quizzes, src/controllers/courses/quiz.controller.js, src/validators/quizzes, src/controllers/courses/review.controller.js

**Enrollments & Progress**
- **Feature**: Enroll free/paid, progress tracking, completion detection, certificate generation.
- **Description**: Enrollments track lesson completion and percentage; on 100% completion, certificates are generated (PDF) and optionally uploaded to Supabase.
- **Key files**: src/routes/enrollments, src/services/courses/certificate.service.js, src/cron/studentProgress.cron.js

**Payments & Coupons**
- **Feature**: Payment logging, payment statuses, coupon application, coupon CRUD.
- **Description**: The backend records payments and supports coupon validation. Payment_method accepts card/paypal/stripe (gateway integration is left as provider implementation in services or front-end flow).
- **Key files**: src/routes/payments, src/services/payments/payment.service.js, src/services/payments/coupon.service.js, src/models/payments

**Media & Storage**
- **Feature**: Cloudinary signed upload endpoints (video/image/materials) and Supabase storage for certificates and materials.
- **Description**: Cloudinary is used for media hosting; endpoints return signatures/apiKey for client direct uploads. Supabase is used to store certificates/materials and generate public/download URLs.
- **Env keys**: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_CERTIFICATES_BUCKET, SUPABASE_MATERIALS_BUCKET
- **Key files**: src/controllers/media/cloudinary.controller.js, src/utils/supabaseStorage.util.js, src/controllers/media/materialUpload.controller.js

**Chat & Real-time Notifications**
- **Feature**: Socket.io based chat, chat rooms, message persistence, Redis-backed caching for recent messages, real-time notifications.
- **Description**: Chat socket setup in app.js; Redis used for caching message lists to reduce DB reads; notification broadcasting is handled via queues for reliability.
- **Key files**: src/sockets/chat.socket.js, src/caching/redis.util.js, src/routes/communication, src/workers/notificationWorker.js

**Background Queues & Workers**
- **Feature**: Bull queues for logging, notifications, analytics, emails; workers process jobs and perform retries/backoff.
- **Description**: addXJob helpers and queue configuration centralize retry/backoff; workers run from src/workers/* and queue configuration in src/config/queue.js.
- **Key files**: src/config/queue.js, src/workers, src/config/redis.js

**Cron Jobs & Scheduled Emails**
- **Feature**: Monthly student progress emails and instructor performance emails via node-cron.
- **Description**: initCronJobs schedules monthly runs that compute stats and send templated HTML emails via nodemailer.
- **Key files**: src/cron/init.cron.js, src/cron/studentProgress.cron.js, src/cron/instructorPerformance.cron.js

**AI Features**
- **Feature**: Google Gemini integration for content analysis, course review suggestions, report recommendations.
- **Description**: Uses @google/genai; aiSecurity service sanitizes input/output and enforces forbidden actions. AI features gracefully degrade if API keys are not configured.
- **Env keys**: GEMINI_API_KEY (or provider credentials as required by @google/genai)
- **Key files**: src/services/ai/gemini.service.js, src/services/ai/aiSecurity.service.js, src/controllers/ai

**Admin Tools & Moderation**
- **Feature**: Admin endpoints for platform analytics, user management, course approvals, moderation logs.
- **Description**: Admin routes are protected by authorize('admin') and audited via auditLogMiddleware.
- **Key files**: src/routes/admin, src/controllers/admin, src/middlewares/auditLog.middleware.js

**Audit Logging & Errors**
- **Feature**: Central audit logging middleware and consistent error handling middleware.
- **Description**: Audit logs capture admin actions; error middleware returns structured errors and shows details in development.
- **Key files**: src/middlewares/auditLog.middleware.js, src/middlewares/error.middleware.js

**Rate Limiting & Validation**
- **Feature**: express-rate-limit instances for general and auth-specific throttling; express-validator used for request validation.
- **Key files**: src/rate-limiters, src/validators, src/middlewares/validateResult.middleware.js

**Security Practices**
- **Feature**: Password hashing (bcrypt), JWT for sessions, token expiry for verification/reset, input sanitization for AI and HTML.
- **Notes**: Ensure strong `JWT_SECRET`, use HTTPS in production, rotate mail credentials, and monitor Redis access.
- **Key files**: src/services/auth (bcrypt & token), src/middlewares/auth.middleware.js, src/services/ai/aiSecurity.service.js

**Export & Reporting**
- **Feature**: Certificate PDF generation (pdfkit), CSV exports (json2csv), QR codes.
- **Key files**: src/services/courses/certificate.service.js, src/utils/pdf/certificate util (if present), src/services/reports

**Third-party Integrations**
- **Included**: Cloudinary, Supabase, Google GenAI (@google/genai), Redis (ioredis), Bull queues, Nodemailer (Gmail), Resend (optional package present), socket.io.
- **Key files/setup**: src/config/* and relevant util files.

**Environment Variables (required / recommended)**
- **DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_SSL**: Database connection (Sequelize). Defaults present in src/config/db.js.
- **REDIS_HOST, REDIS_PORT, REDIS_PASSWORD**: Redis connection used for caching and queues. src/config/redis.js throws if host/port missing.
- **JWT_SECRET, JWT_EXPIRES_IN**: JWT signing secret and expiration used across auth services.
- **PORT**: Server port; default 3000.
- **CLIENT_URL**: Frontend origin used in email links and cron templates.
- **GMAIL_USER, GMAIL_APP_PASSWORD**: Nodemailer SMTP credentials (Gmail) used by mailer.js.
- **CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET**: Cloudinary signed upload configuration.
- **SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_CERTIFICATES_BUCKET, SUPABASE_MATERIALS_BUCKET**: Supabase storage for certificates & materials. isSupabaseConfigured() used to gate behavior.
- **GEMINI_API_KEY**: (or provider credential) required to enable AI features; code checks service initialization and surfaces friendly errors when missing.
- **NODE_ENV**: affects error responses and logging.

**Where to find the API docs & Postman collection**
- **API docs**: See [backend/docs/ALL_API_DOCUMENTATION.md](backend/docs/ALL_API_DOCUMENTATION.md) for consolidated endpoint docs.
- **Postman**: Collection is at [backend/docs/postman_collection.json](backend/docs/postman_collection.json) — includes collection variables `base_url` and `token`.

**Code Structure Summary**
- **API routing**: src/routes/* — every resource has its own route file.
- **Controllers**: src/controllers/* — thin controllers invoking services and returning responses.
- **Services**: src/services/* — business logic, DB access, third-party calls.
- **Validators**: src/validators/* — request schema validation (express-validator).
- **Middlewares**: src/middlewares/* — auth, audit logging, caching, uploads, error handling.
- **Workers**: src/workers/* — background job processors.
- **Config**: src/config/* — DB, Redis, mailer, queues.

**Deployment & Production Checklist**
- **Secret management**: Provide strong `JWT_SECRET`, rotate mail and cloud keys; use secrets manager (AWS Secrets Manager / Azure Key Vault / GitHub Secrets).
- **Secure Redis**: Use a managed Redis with authentication and VPC access; set `REDIS_PASSWORD`.
- **Use HTTPS**: Terminate TLS at load balancer or proxy (NGINX), enable secure cookies if used.
- **Database migrations**: Use controlled migrations (Sequelize migrations recommended) — avoid `sync({ alter: true })` in production.
- **Monitoring & Errors**: Add Sentry or similar for error tracking; configure logging and alerts for queue failures.
- **Scale queues**: Deploy workers separately from web API; tune Bull concurrency and backoff.