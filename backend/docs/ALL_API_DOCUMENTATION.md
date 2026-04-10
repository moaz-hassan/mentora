# Complete API Documentation (All Endpoints)

This single-file API documentation contains every backend endpoint with method, path, authentication, request fields (URL/query/body/headers), validation rules (where available), sample request bodies, and typical success/error responses. Use this as the canonical reference for the backend API.

---

## Standard responses and error formats

- Success (generic):
{
  "success": true,
  "data": ... ,
  "message": "..." // optional
}

- List responses (common):
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}

- Validation error (400):
{
  "success": false,
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": [ { "field": "email", "message": "Please provide a valid email" } ]
}

- Duplicate entry (400):
{
  "success": false,
  "message": "email already exists",
  "code": "DUPLICATE_ENTRY",
  "field": "email"
}

- Unauthorized (401):
{
  "success": false,
  "message": "Invalid credentials",
  "code": "ERROR"
}

- Token errors (401):
Invalid token:
{
  "success": false,
  "message": "Invalid token",
  "code": "INVALID_TOKEN"
}
Expired token:
{
  "success": false,
  "message": "Token expired",
  "code": "TOKEN_EXPIRED"
}

- Rate limited (429): message varies per limiter, e.g. for login:
{
  "success": false,
  "message": "Too many login attempts. Please try again after 15 minutes."
}

- Internal server error (500):
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later.",
  "code": "INTERNAL_ERROR"
}

---

Table of contents
- Auth
- Users
- Profile
- Certificates
- Categories & Subcategories
- Courses (course-level)
- Chapters & Lessons & Materials
- Quizzes & Reviews
- Enrollments
- Coupons
- Payments
- Reports
- Communication (Chat & Notification)
- AI
- Instructor routes
- Admin routes

---

# AUTH

## POST /api/auth/register
- Auth: None
- Rate limiting: `registerLimiter` (3/hr)
- Headers: `Content-Type: application/json`
- Body JSON:
  - `first_name` (string, required, 2-255)
  - `last_name` (string, required, 2-255)
  - `email` (string, required, valid email)
  - `password` (string, required, min 6, must include uppercase, lowercase, digit, special char)
  - `role` (string, optional, one of `student`, `instructor`, `admin`) — default `student`
- Example request:
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "password": "S3cure@123",
  "role": "student"
}
- Success (201):
{
  "success": true,
  "message": "User registered successfully, check your email for verification"
}
- Errors: validation 400, duplicate 400, rate-limited 429, 500

## POST /api/auth/login
- Auth: None
- Rate limiting: `loginLimiter` (5 failed attempts / 15m)
- Headers: `Content-Type: application/json`
- Body JSON:
  - `email` (string, required)
  - `password` (string, required)
- Success (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object without password */ },
    "token": "<JWT>"
  }
}
- Errors: 401 invalid credentials, 429, 500

## POST /api/auth/verify-email
- Auth: None
- Body:
  - `email` (string, required)
  - `token` (string, required)
- Success (200): { "success": true, "message": "Email verified successfully" }
- Errors: 400 invalid/expired token, 404 user not found

## POST /api/auth/forgot-password
- Auth: None
- Rate limit: `passwordResetLimiter` (3/hr)
- Body: { "email": "user@example.com" }
- Success (200): { "success": true, "message": "Password reset email sent, check your email" }
- Errors: 404 user not found, 429

## POST /api/auth/reset-password
- Auth: None
- Rate limit: same as forgot-password
- Body:
  - `email` (string)
  - `token` (string)
  - `newPassword` (string, min 6)
- Success: { "success": true, "message": "Password has been reset successfully, you can now login" }
- Errors: 400 invalid/expired token, 404 user not found

## GET /api/auth/me
- Auth: Bearer token required
- Returns: current user (without password), includes `Profile` if any
- Success example (200):
{
  "success": true,
  "data": { "id": 1, "first_name": "Jane", "email": "jane@example.com", "role": "student", "Profile": { /*...*/ } }
}

## POST /api/auth/change-password
- Auth: Bearer token required
- Body: { "currentPassword": "old", "newPassword": "New@123" }
- Success (200): { "success": true, "message": "Password changed successfully" }
- Errors: 401 invalid current password, 404 user not found

## POST /api/auth/resend-verification-email
- Auth: Bearer token required
- Success: { "success": true, "message": "Verification email sent successfully" }
- Errors: 400 if already verified, 404 user not found

---

# USERS

## GET /api/users/
- Auth: admin
- Query: optional paging/filtering handled in service
- Success (200): { "success": true, "count": N, "data": [ users ] }

## GET /api/users/:id
- Auth: required (admin for all users or owner?) — route requires authenticate + userIdValidator; controller returns user by id
- Params: `id` (path)
- Success (200): { "success": true, "data": { user } }

## POST /api/users/
- Auth: admin
- Body: (see `createUserValidator`)
  - `full_name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `role` (optional: student/instructor/admin)
- Success (201): { "success": true, "message": "User created successfully", "data": { user } }

## PUT /api/users/:id
- Auth: admin
- Body: fields to update (see `updateUserValidator`)
- Success (200): { "success": true, "message": "User updated successfully", "data": { user } }

## DELETE /api/users/:id
- Auth: admin
- Success (200): { "success": true, "message": "<message>" }

## POST /api/users/become-instructor
- Auth: student (route uses authorize("student"))
- Body: none — service `becomeInstructor` handles role change or request
- Success (200): { "success": true, "message": "Congratulations! You are now an instructor...", "data": { user } }

---

# PROFILE

## GET /api/users/profile
- Auth: required
- Success: { "success": true, "data": { profile } }

## PUT /api/users/profile
- Auth: required
- Body fields allowed (per `updateProfile` logic):
  - `first_name` (optional)
  - `last_name` (optional)
  - `bio` (optional)
  - `avatar_url` (optional)
  - `headline` (optional)
  - `social_links` (optional object/array)
- Success (200): { "success": true, "message": "Profile updated successfully", "data": { profile } }

---

# CERTIFICATES

## POST /api/users/certificate/generate
- Auth: required
- Body: { "courseId": <number> } (required)
- Success (201): { "success": true, "message": "Certificate generated successfully", "data": { certificate } }
- Errors: 400 if courseId missing

## GET /api/users/certificate/my
- Auth: required
- Success: { "success": true, "count": N, "data": [ certificates ] }

## GET /api/users/certificate/check/:courseId
- Auth: required
- Returns { success: true, exists: true/false, data: certificate|null }

## GET /api/users/certificate/:id/verify
- Auth: none
- Returns validity of certificate (200), message indicates valid or not, `data` contains minimal verification info if valid

## GET /api/users/certificate/:id/download
- Auth: required
- Returns: { success: true, downloadUrl: "https://..." }

## GET /api/users/certificate/:id
- Auth: required
- Returns certificate metadata

## GET /api/users/certificate/
- Auth: admin
- Query filters supported: `student_id`, `course_id`, `verified`
- Returns list

---

# CATEGORIES & SUBCATEGORIES

## GET /api/categories/
- Public, cached
- Success: { "success": true, "data": [ categories ] }

## GET /api/categories/:id
- Params: id
- Success: { "success": true, "data": { category } }

## GET /api/categories/:id/subcategories
- Params: id
- Success: { "success": true, "data": [ subcategories ] }

## POST /api/categories/
- Auth: admin
- Body: { "name": "Category Name" }
- Success (201): { "success": true, "message": "Category created", "data": { category } }

## PUT /api/categories/:id
- Auth: admin
- Body: { "name": "New Name" }
- Success: { "success": true, "message": "Category updated", "data": { category } }

## DELETE /api/categories/:id
- Auth: admin
- Success: { "success": true, "message": "Category deleted" }

## SUBCATEGORIES endpoints mirror categories but under /api/subcategories/
- POST/PUT/DELETE require admin

---

# COURSES (course-level)

## GET /api/courses/
- Public (caching middleware)
- Query params: supports `page`, `limit`, `search`, `category`, `sort`, etc. (handled by `courseQueryValidator`)
- Success: { "success": true, "count": N, "data": [ courses ] }

## GET /api/courses/featured
- Public, cached
- Success: list of featured courses

## GET /api/courses/search
- Query: q or other search params
- Success: list of matched courses

## POST /api/courses/
- Auth: instructor
- Multipart form (thumbnail upload via `uploadThumbnail` middleware)
- Body fields (createCourseValidator — see validators/courses/course.validator.js): likely fields include:
  - `title` (string, required)
  - `description` (string)
  - `price` (number)
  - `category_id` (number)
  - `sub_category_id` (number)
  - `is_free` (boolean)
  - `language`, `level`, `tags`, `duration`, etc.
- Success (201): { "success": true, "message": "Course created", "data": { course } }

## PUT /api/courses/:id/intro-video
- Auth: instructor
- Body: probably `intro_video_url` or multipart upload
- Success: 200 with message and updated course

## POST /api/courses/:id/save-draft
- Auth: instructor
- Purpose: save draft state
- Success: 200 saved

## POST /api/courses/:id/submit-review
- Auth: instructor
- Submits course for admin review
- Success: 200

## GET /api/courses/:id/related
- Public
- Success: { "success": true, "data": [ related courses ] }

---

# CHAPTERS, LESSONS, MATERIALS

## POST /api/courses/chapters/
- Auth: instructor|admin
- Body (createChapterValidator): `course_id`, `title`, `position` (optional)
- Success (201): { "success": true, "message": "Chapter created", "data": { chapter } }

## PUT /api/courses/chapters/:id
- Auth: instructor|admin
- Body: fields to update

## DELETE /api/courses/chapters/:id
- Auth: instructor|admin
- Success: 200

## LESSONS
- GET /api/courses/lessons/:id (auth required)
- POST /api/courses/lessons/ (instructor): create lesson; body includes `chapter_id`, `title`, `type` (video/text/quiz), `content`, `duration`, `is_preview`, etc.
- PUT /api/courses/lessons/:id (instructor)
- DELETE /api/courses/lessons/:id (instructor/admin)

## LESSON MATERIALS
- POST /api/courses/lessons/:lessonId/materials (auth required) — multipart/form-data or JSON fields describing material
- GET /api/courses/lessons/:lessonId/materials — returns array of materials
- DELETE /api/courses/materials/:materialId — deletes material
- PUT /api/courses/lessons/:lessonId/materials/order — body: { order: [ materialId1, materialId2, ... ] }

---

# QUIZZES & REVIEWS

## QUIZZES
- GET /api/courses/quizzes/:id (auth)
- POST /api/courses/quizzes/ (instructor)
  - Body (createQuizValidator) usually includes `course_id`, `title`, `questions` (array), each question has `text`, `type`, `options`, `correct_answer`
- PUT /api/courses/quizzes/:id (instructor)
- DELETE /api/courses/quizzes/:id (instructor)
- GET /api/courses/quizzes/:quizId/results (instructor) — returns results list
- POST /api/courses/quizzes/submit (auth): body with `quizId`, `answers` => returns score and result object
- GET /api/courses/quizzes/results/student/:studentId (auth) — returns student quiz attempts

## REVIEWS
- GET /api/courses/reviews/ (auth) — list
- GET /api/courses/reviews/course/:courseId — public
- POST /api/courses/reviews/ (auth) — body includes `course_id`, `rating`, `comment`
- PUT /api/courses/reviews/ (auth) — update review; validator expects `id` + fields
- DELETE /api/courses/reviews/ (auth) — delete review by id

---

# ENROLLMENTS

## GET /api/courses/enrollments/
- Auth required (admin or instructor depending on route)
- Query params handled by `enrollmentQueryValidator`
- Success: list with count

## GET /api/courses/enrollments/check/:courseId
- Auth required
- Returns { success: true, enrolled: true/false }

## GET /api/courses/enrollments/:id
- Auth required
- Returns enrollment object

## POST /api/courses/enrollments/
- Auth: student
- Body (createEnrollmentValidator): likely `course_id`, `payment_method` or `coupon_code`
- Success (201): returns enrollment, message

## POST /api/courses/enrollments/:id/complete-lesson
- Auth: student
- Body: likely `lesson_id` (validated by `lessonIdValidator`)
- Success: { success: true, message: 'Lesson marked complete' }

## PUT /api/courses/enrollments/:id/current-position
- Auth: student
- Body: `lesson_id`, `position` (timestamp) — updates playback position

## GET /api/courses/enrollments/:enrollmentId/course/:courseId/access
- Auth: required
- Purpose: verify access to the course (returns boolean/access metadata)

## GET /api/courses/enrollments/:enrollmentId/course/:courseId/player
- Auth: required
- Returns course player data (lesson list, current position, next lesson, playback urls)

---

# COUPONS

## GET /api/courses/coupons/admin
- Auth: admin
- Returns list of coupons with analytics

## GET /api/courses/coupons/instructor
- Auth: instructor

## POST /api/courses/coupons/
- Auth: instructor|admin
- Body (createCouponValidator): fields include `code` (string, required), `discount_type` (`percentage`|`fixed`), `discount_value` (number > 0), `expires_at` (date), `max_uses`, `applicable_course_ids` (array)
- Success: 201 created

## PUT/DELETE /api/courses/coupons/ (instructor/admin)
- Body: fields to update or deletion identifiers

## POST /api/courses/coupons/validate
- Auth: required
- Body: { "code": "PROMO123", "course_id": 123 }
- Success: { "success": true, "valid": true, "discount": { "type": "percentage", "value": 20 }, "newPrice": 80 }

## GET /api/courses/coupons/global-promo
- Public
- Returns a single active global coupon object or null

---

# PAYMENTS

## GET /api/payments/
- Auth: admin
- Query: `page`, `limit`, filters handled by `paymentQueryValidator`
- Success: list of payments

## GET /api/payments/:id
- Auth: required
- Returns payment details

## POST /api/payments/
- Auth: required
- Body (createPaymentValidator): fields depend on payment provider but commonly:
  - `amount` (number, required)
  - `currency` (string)
  - `method` (string)
  - `course_id` or `enrollment_id`
  - `metadata` (object)
- Success (201): created payment/transaction object

## PUT /api/payments/:id (admin) and DELETE /api/payments/:id (admin)
- Admin-only update/delete

---

# REPORTS

## POST /api/reports/
- Auth: required
- Body: fields depend on report type — may include `type`, `target_id`, `description`, `attachments`
- Success (201): created report

## GET /api/reports/
- Auth: admin
- Success: list

## GET /api/reports/stats
- Auth: admin
- Success: analytics summary

## GET /api/reports/:id
- Auth: admin
- Success: report details

## PATCH /api/reports/:id/status
- Auth: admin
- Body: `status` must be one of ["pending","in-review","resolved","dismissed"]
- Success: updated report object

## GET /api/reports/:id/ai-summary and /:id/recommendations
- Auth: admin
- Return AI-generated summaries or action recommendations

---

# COMMUNICATION — CHAT & NOTIFICATIONS

## CHAT
All chat endpoints require auth (except socket real-time auth handled separately).

- GET /api/communication/chat/rooms — list rooms
- GET /api/communication/chat/rooms/:id — room details
- GET /api/communication/chat/rooms/course/:courseId — room for a course
- POST /api/communication/chat/rooms — create room (instructor/admin)
  - Body: { name, course_id?, is_group? }
- DELETE /api/communication/chat/rooms/:id — admin only
- GET /api/communication/chat/rooms/:roomId/messages — messages for room
- GET /api/communication/chat/messages/:id — single message
- POST /api/communication/chat/messages — create message
  - Body: { room_id, content, attachments? }
- DELETE /api/communication/chat/messages/:id
- GET /api/communication/chat/user/rooms — rooms for current user
- POST /api/communication/chat/private — create private chat (body: { user_id })
- PUT /api/communication/chat/rooms/:roomId/read — mark as read
- GET /api/communication/chat/unread-count
- GET /api/communication/chat/rooms/:roomId/messages/paginated — supports `page` & `limit`
- POST /api/communication/chat/join — body: { room_id }
- GET /api/communication/chat/membership/:courseId — checks membership
- GET /api/communication/chat/:roomId/messages/cursor — cursor-based pagination
- POST /api/communication/chat/:roomId/message — optimized send with cache; body: { content }

Success examples: message create returns created message object with id, sender, content, timestamp.

## NOTIFICATIONS
- GET /api/communication/notification/ — list
- POST /api/communication/notification/mark-all-read — marks all as read
- GET /api/communication/notification/unread-count — returns count
- GET /api/communication/notification/:id — single notification
- POST /api/communication/notification/ — admin broadcast create
  - Body: { title, message, targetAudience: 'all'|'students'|'instructors' }
- PUT /api/communication/notification/:id — update
- DELETE /api/communication/notification/:id — delete

Success: create returns created notification object; mark-all-read returns success message.

---

# AI

## POST /api/ai/chat
- Auth: optional
- Body: { "prompt": "...", "context": { ... } }
- Success: AI response payload, e.g. { success:true, data:{ reply: "...", usage: {...} } }

## GET /api/ai/examples
- Auth: optional
- Success: list of example prompts

## POST /api/ai/analyze
- Auth: optional
- Body: { "text": "..." }
- Success: analysis object

## POST /api/ai/suggest
- Auth: optional
- Body: { context }
- Success: suggestion list

---

# INSTRUCTOR ROUTES

## GET /api/instructor/all (mounted at /api/instructor/courses?)
- Auth: instructor
- GET /api/instructor/courses/all — returns instructor's courses
- DELETE /api/instructor/courses/:id — delete course (only draft/rejected w/o enrollments)

## GET /api/instructor/analytics/
- Auth: instructor
- Query params validated by `validateAnalyticsQuery`
- Endpoints: `/api/instructor/analytics/` (overview), `/export`, `/revenue`, `/enrollments`, POST `/report` to generate custom report

---

# ADMIN ROUTES (overview)

All `/api/admin/*` endpoints require `authenticate` and `authorize('admin')` plus `auditLogMiddleware` in many places.

Key routes and behaviors (representative):
- `/api/admin/analytics/overview` — platform overview
- `/api/admin/analytics/revenue` — revenue analytics
- `/api/admin/categories/*` — admin-level category management (search, create, update, delete)
- `/api/admin/coupons/*` — admin coupon management and analytics
- `/api/admin/courses/*` — pending courses list, course details, analyze, approve, reject, toggle featured
  - POST `/api/admin/courses/:id/approve` — approve course (200)
  - POST `/api/admin/courses/:id/reject` — body has `rejection_reason` (min 10 chars)
- `/api/admin/financial/*` — financial overview, revenue, payouts, transactions
- `/api/admin/instructors/*` — get instructor list, details, analytics, set status, payouts
- `/api/admin/logs/*` — audit/payment/enrollment/error logs, export
- `/api/admin/notifications/*` — broadcast and scheduled notifications
- `/api/admin/settings/*` — get/create/update/bulk update settings
- `/api/admin/reports/*` — report management and AI summaries

Admin endpoints generally return analytical objects or success messages; POST/PUT endpoints return 201/200 with `data` or `message`.

---

# Notes and recommendations
- Use `Authorization: Bearer <JWT>` header for protected endpoints.
- For multipart endpoints (file uploads), send `multipart/form-data` with appropriate fields and files. `upload.middleware.js` handles multer errors.
- Validation rules are applied via express-validator and custom validators; invalid inputs return `VALIDATION_ERROR` with field-level details.
- Rate limiting is applied to sensitive endpoints (see `src/rate-limiters`) — expect 429 responses if exceeded.
- For endpoints returning lists, controllers typically include `count` and `data` fields.

---

File generated from route files and validators present in the codebase. For exact field-level constraints, see the corresponding validator files in `src/validators/` and controller behavior in `src/controllers/`.

If you want, I can now:
- Convert this to a printable PDF (PDF export),
- Generate a complete Postman collection (with example bodies and auth pre-request scripts), and
- Run a Codecanyon readiness checklist and produce a remediation plan.

Which would you like me to do next? (I'll start on the Postman collection if you say "yes, generate Postman collection")
