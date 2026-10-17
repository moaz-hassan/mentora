# Mentora Backend System Design

This document is the implementation-oriented companion to the UML data
design in [`uml_data_design.drawio`](./uml_data_design.drawio). It describes
the backend that currently exists in `backend/src`, including the request
pipeline, module boundaries, endpoint groups, persistence, asynchronous
processing, and known design gaps.

## 1. Runtime topology

```text
Next.js client
   |
   | HTTPS / JSON, multipart, Stripe webhook, Socket.io
   v
Express application (src/app.js)
   |---------------------> Socket.io handlers (src/sockets)
   |
   +--> Controllers --> Services --> Repositories --> Mongoose models --> MongoDB
   |
   +--> Redis cache and Bull queues
   |        +--> logging worker
   |        +--> notification worker
   |
   +--> Cloudinary / Supabase Storage
   +--> Gmail SMTP
   +--> Stripe
   +--> Gemini
```

The process entry point is [`server.js`](../server.js). It connects to
MongoDB, starts the HTTP/Socket.io server, and then starts the monthly cron
jobs. [`src/app.js`](../src/app.js) creates the Express application, mounts
routes, connects Redis, and attaches Socket.io.

## 2. HTTP request lifecycle

### Global application order

The application applies these global handlers in order:

1. CORS with credentials and the configured client origin.
2. `express.json()`.
3. `express.urlencoded({ extended: true })`.
4. `cookieParser()`.
5. Route-specific middleware.
6. `notFound`.
7. `errorHandler`.

The general limiter is available but currently commented out in `src/app.js`.
Authentication and other limiters are attached at route level.

### Protected request

```text
Client
  |
  v
Route-specific limiter (when configured)
  |
  v
authenticate
  |-- require Authorization: Bearer <JWT>
  |-- jwt.verify(JWT_SECRET)
  |-- userRepository.findById(decoded.id)
  |-- compare decoded.email with persisted user.email
  |-- reject unverified user (401)
  |-- reject inactive user (403)
  `-- attach persisted user to req.user
  |
  v
authorize("student" | "instructor" | "admin") (when configured)
  |
  v
Multer / express-validator / validateResult (when configured)
  |
  v
Controller
  |-- reads request values
  |-- calls service
  `-- returns JSON or calls next(error)
  |
  v
Service
  |-- business rules
  |-- repository calls
  |-- cache, storage, queue, or external integration
  |
  v
Repository
  |
  v
Mongoose model / MongoDB
```

`optionalAuth` decodes a bearer token when present and otherwise continues. It
does not load the user from the repository and it intentionally ignores token
errors.

## 3. Authentication module

### Components

| Layer | Implementation |
|---|---|
| Routes | [`src/routes/auth/auth.routes.js`](../src/routes/auth/auth.routes.js) |
| Controller | [`src/controllers/auth/auth.controller.js`](../src/controllers/auth/auth.controller.js) |
| Service | [`src/services/auth/auth.service.js`](../src/services/auth/auth.service.js) |
| User repository | [`src/repositories/auth/user.repository.js`](../src/repositories/auth/user.repository.js) |
| Token repository | [`src/repositories/auth/token.repository.js`](../src/repositories/auth/token.repository.js) |
| Profile repository | [`src/repositories/auth/profile.repository.js`](../src/repositories/auth/profile.repository.js) |
| Middleware | [`src/middlewares/auth.middleware.js`](../src/middlewares/auth.middleware.js) |
| Validators | [`src/validators/auth/auth.validator.js`](../src/validators/auth/auth.validator.js) |
| Persistence | `User`, `Profile`, and `Token` models |
| External integration | Gmail SMTP through [`email.service.js`](../src/services/auth/email.service.js) |

### Registration

`POST /api/auth/register` is rate-limited by `registerLimiter`, validated by
`registerValidator`, and then handled by `registerUser`.

```text
body
  -> validate first_name, last_name, email, password, optional role
  -> find user by email
  -> bcryptjs hash with salt factor 10
  -> create 10-minute verification token
  -> send verification email
  -> create User
  -> create standalone Profile compatibility record
  -> 201 response
```

The current validator permits `student`, `instructor`, and `admin` in the
request body. If public registration must not create admins, that policy needs
to be enforced in the validator/service.

### Login

`POST /api/auth/login` is rate-limited and validated before `loginUser`.

```text
email/password
  -> find user including password
  -> bcrypt.compare
  -> jwt.sign({ id, email, role }, JWT_SECRET, expiresIn)
  -> remove password from response
  -> return { success, message, data: { user, token } }
```

### Verification and password reset

```text
verify-email:
  email + token
    -> Token repository lookup by email/token/purpose
    -> mark User.email verified
    -> delete Token

forgot-password:
  email
    -> find User
    -> delete old reset tokens
    -> create 10-minute reset token
    -> send reset email

reset-password:
  email + token + newPassword
    -> validate reset token and expiry
    -> bcrypt hash new password
    -> update User password
    -> delete Token
```

### Authentication failure mapping

| Condition | Response |
|---|---|
| Missing bearer token | 401 |
| Invalid JWT | 401 |
| Expired JWT | 401 |
| User missing or email mismatch | 401 |
| Email not verified | 401 and a new verification email is attempted |
| Inactive account | 403 |
| Role mismatch | 403 |

## 4. Domain modules and connections

### User/profile

Routes under `/api/users`, `/api/profile`, `/api/certificates`, and
`/api/auth/me` use user/profile services and repositories. Admin user routes
are mounted under `/api/admin/users` and are protected at the application
mount point.

Connections: Auth -> User/Profile, User -> Course ownership, User -> Enrollment,
User -> Payment, User -> Chat/Notification, Admin -> AuditLog.

### Course and curriculum

Course routes are mounted under `/api/courses`; related curriculum routes are
mounted under `/api/chapters`, `/api/lessons`, `/api/quizzes`, and
`/api/materials`.

Typical instructor request:

```text
POST /api/courses
  -> authenticate
  -> authorize("instructor")
  -> uploadThumbnail + handleMulterError
  -> createCourseValidator + validateResult
  -> courseController.createCourse
  -> courseService
  -> courseRepository
  -> Course model
```

Public catalog reads use caching middleware. Lesson playback has two paths:

* `GET /api/lessons/:id/stream`: optional auth, stream limiter, access logging.
* `GET /api/lessons/:id/play`: required auth, playback limiter, access logging.

### Enrollment and progress

Enrollment routes under `/api/enrollments` protect enrollment creation and
student progress with `authenticate` and, where configured,
`authorize("student")`. The module verifies access, loads player data, updates
current position, marks lessons complete, updates progress, and submits quiz
results.

```text
student request
  -> authenticate
  -> enrollment validator
  -> enrollment controller
  -> enrollment/progress service
  -> enrollment/course/lesson repositories
  -> Enrollment progress state
```

### Payments

Payment routes are mounted under `/api/payments`.

* `POST /api/payments`: creates a pending payment record after checking the
  course.
* `POST /api/payments/stripe-intent`: creates a Stripe PaymentIntent.
* `POST /api/payments/webhook`: uses `express.raw({ type: "application/json" })`
  and must verify the Stripe signature through `stripe.service.js`.
* Admin reads/updates/deletes use the `admin` role.

The webhook is an external ingress path and does not pass through
`authenticate`. Payment fulfillment must be treated as idempotent by payment
identifier/event identifier before creating dependent enrollment records.

### Communication

HTTP chat and notification routes are mounted under `/api/chat` and
`/api/notifications`. Socket.io is attached to the same HTTP server.

```text
socket connection
  -> authenticate event
  -> join_room / leave_room
  -> send_message
  -> typing / mark_read / check_online_status
  -> disconnect
```

Handlers are split under `src/sockets/group-chat`. HTTP message persistence and
Socket.io events are separate interfaces over the communication services.

### Media and storage

Cloudinary signature routes are mounted under `/api/cloudinary` and require
authentication. Material upload is mounted under `/api/materials`, applies
authentication and Multer memory storage, and delegates to the material upload
controller.

The upload middleware accepts one file, applies field-specific MIME/extension
checks, and limits the normal upload to 100 MB (thumbnail configuration: 10
MB). Cloudinary is used for media signatures/video delivery and Supabase
storage utilities are available for material/file persistence.

### AI, reporting, and administration

* `/api/ai` exposes optional-auth chat, examples, analysis, and suggestions.
* `/api/reports` exposes reporting operations.
* `/api/instructor/*` exposes instructor statistics and analytics.
* `/api/admin/*` is mounted with `authenticate`, `authorize("admin")`, and
  `auditLogMiddleware` in `src/app.js`.

Admin mutating requests are recorded after the response finishes. The audit
middleware builds an action/resource payload and calls the logging service.

## 5. Persistence model

The model registry in [`src/models/index.js`](../src/models/index.js) contains:

```text
User, Profile, Token
Course, Chapter, Lesson, LessonMaterial, Quiz, QuizResult, Ratings
Enrollment, Certificate
Category, SubCategory
Payment, PaymentLog, Coupon
ChatRoom, ChatMessage, ChatParticipant
Notification, NotificationLog
Report
AuditLog, EnrollmentLog, ModerationLog, ErrorLog
Settings, Campaign, FeaturedCourse
```

Repositories are grouped by the same domains and are the intended data-access
boundary. Services should orchestrate repositories rather than issue direct
Mongoose queries.

## 6. Redis, queues, workers, and cron

`src/config/redis.js` creates the Redis client and fails startup configuration
when `REDIS_HOST` or `REDIS_PORT` is missing. `src/config/queue.js` defines:

* `loggingQueue`
* `notificationQueue`
* `analyticsQueue`
* `emailQueue`

Queue defaults are three attempts with exponential backoff and completed/failed
job retention. The current worker entry point imports:

* `loggingWorker.js`: batches log jobs and flushes them at 50 records or after
  five seconds.
* `notificationWorker.js`: processes scheduled/broadcast notification jobs and
  checks for scheduled notifications every 60 seconds.

The current repository does not contain worker processors for `analyticsQueue`
or `emailQueue`; producers for those queues must not be depicted as active
workers until processors are added.

Cron schedules are defined in `src/cron/init.cron.js`:

* `0 9 1 * *`: monthly student progress emails.
* `0 10 1 * *`: monthly instructor performance emails.

## 7. Error and response contracts

`error.middleware.js` maps:

* Mongoose validation errors -> 400 `VALIDATION_ERROR`.
* Duplicate key errors -> 409 `DUPLICATE_ENTRY`.
* Mongoose cast errors -> 400 `INVALID_ID`.
* JWT errors -> 401.
* Explicit `statusCode` errors -> that status.
* Unhandled errors -> 500 `INTERNAL_ERROR`, with details only in development.

Validation middleware returns 400 with:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Please provide a valid email" }]
}
```

## 8. Implementation gaps shown in the diagram

These are intentionally labelled as gaps rather than silently designed as if
they already exist:

1. `authenticate` currently reads the bearer header; it does not read
   `req.cookies.token`, despite `cookieParser` being configured.
2. `change-password` and `resend-verification-email` are mounted without their
   dedicated validators.
3. Several admin route files rely on protection from `src/app.js`; they are not
   independently protected when imported elsewhere.
4. The queue configuration defines email and analytics queues, but the current
   worker entry point only starts logging and notification processors.
5. (Resolved Oct 2026) The logging worker was converted from Sequelize-style
   `bulkCreate` calls to Mongoose `insertMany` with duplicate-key tolerance;
   see `NOSQL_MIGRATION_AUDIT.md` (Execution Log).
6. The current application connects Redis during `app.js` import and does not
   await `connectRedis()` in `server.js`; Redis startup behavior should be made
   explicit before production deployment.
7. Stripe fulfillment and multi-document payment/enrollment/audit changes need
   an explicit idempotency and transaction boundary.

The Draw.io pages use a red “gap” marker for these items so the architecture
does not claim behavior that the code does not currently guarantee.
