# Mentora AI Agent Guide & Rules (`AGENTS.md`)

This document defines the architectural rules, coding standards, and refactoring guidelines for any AI agent or developer working in the **Mentora** repository.

---

## 1. Project Overview & Architecture

Mentora is an enterprise-grade Learning Management System (LMS) with full course lifecycle management, video streaming (Cloudinary HLS), file delivery (Supabase Storage), real-time chat (Socket.io), payment processing (Stripe), background workers (Bull queues on Redis), and AI-assisted course review (Google Gemini SDK).

### Core Stack
- **Backend Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Web Framework**: Express.js 5.x
- **Database**: MongoDB via Mongoose
- **Caching & Queues**: Redis (ioredis), Bull
- **Real-Time**: Socket.io
- **Media & Storage**: Cloudinary (video streaming & HLS), Supabase Storage (materials & certificates)
- **Frontend**: Next.js 15+ (React 19, Tailwind CSS, Radix UI, TanStack Table, Vidstack)

---

## 2. Directory Layout & Layer Responsibilities

```
backend/
├── src/
│   ├── app.js               # Express application initialization & middleware attachment
│   ├── config/              # Central configuration (db.js, redis.js, queue.js, mailer.js)
│   ├── controllers/         # HTTP request/response handlers (ultra-thin layer)
│   ├── services/            # Pure business logic and domain workflows (thick layer)
│   ├── repositories/        # Pure data-access layer (all Mongoose database queries)
│   ├── models/              # Pure Mongoose schema & index definitions (NO business logic/methods)
│   ├── routes/              # Express routing definitions (separated by domain)
│   ├── middlewares/         # Auth, audit logging, rate limiting, error handling, upload
│   ├── validators/          # Express-validator schemas per domain
│   ├── caching/             # Redis cache manager and cache invalidation utilities
│   ├── cron/                # Scheduled background cron jobs (node-cron)
│   ├── workers/             # Bull queue background workers (logging, notifications)
│   ├── sockets/             # Socket.io event handlers and room management
│   └── utils/               # Storage, sanitization, PDF generation, helpers
└── server.js                # Server entry point (binds HTTP server to port after DB connection)
```

### Layer Rules (STRICT 4-TIER ARCHITECTURE):
1. **Controllers (Ultra-Thin)**:
   - Responsible ONLY for: Reading `req.body`, `req.params`, `req.query`, invoking the appropriate Service, and sending unified JSON HTTP responses (`res.status(...).json(...)`).
   - Controllers **MUST NOT** contain business logic, calculations, or direct database queries.
2. **Services (Business Logic Only)**:
   - Responsible for: Orchestrating domain workflows, applying business rules, computations, permissions checks, triggering events, sending emails, and dispatching queue jobs.
   - Services **MUST NOT** write direct Mongoose queries (`.find()`, `.create()`, `.aggregate()`). They must delegate all database interactions to the **Repositories**.
3. **Repositories (Data Access Only - `src/repositories/`)**:
   - Responsible for: Executing all Mongoose queries, filters, projections, pagination, aggregations, and updates against Mongoose models.
   - Keeps database queries isolated from business rules. If database queries or schemas change, only the repository changes.
4. **Models (Pure Schemas Only - `src/models/`)**:
   - Responsible ONLY for: Declaring schema fields, data types, validators, and indexes.
   - Models **MUST NOT** contain business methods, complex hooks, or business logic functions.
5. **No Circular Dependencies**:
   - Follow strict downward dependency flow: `Routes -> Controllers -> Services -> Repositories -> Models`.
6. **Single Server Entry**:
   - `app.js` configures Express and Socket.io, exporting `{ app, server, io }`. `server.js` initializes DB/Redis connections and starts `server.listen()`. `app.js` **MUST NOT** call `listen()` on import.

---

## 3. MongoDB & Mongoose Design Standards

### Schema & Modeling Principles
1. **Embedding vs. Referencing**:
   - **Embed** entities that are tightly bound to the parent lifecycle and always queried together:
     - `User.profile`: Bio, avatar, social links must be embedded subdocuments in `User`.
     - `Course.chapters` / `lessons`: Embedded chapters containing lesson metadata (video public ID, HLS url, duration, order).
     - `Enrollment.progress`: Embedded progress tracking (`completedLessons`, `quizScores`, `totalWatchTime`).
     - `Quiz.questions`: Embedded array of question objects with options and answers.
   - **Reference** independent or high-growth collections:
     - `Course` references `User` (instructor).
     - `Enrollment` references `User` (student) and `Course`.
     - `Payment` references `User` and `Course`.
     - `ChatMessage` references `ChatRoom` and `User`.
     - `Ratings` references `User` and `Course`.
     - `AuditLog`, `ErrorLog`, `PaymentLog`: Standalone collections with indexing and TTL policies.

2. **Primary Keys & Frontend Contract Preservation**:
   - To preserve backward-compatibility with the frontend and existing client-side stores, models must expose a string `id` field (or standard UUID string `_id` / virtual `id`).
   - Enable `{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }` on all Mongoose schemas.
   - Never expose internal MongoDB version keys (`__v`) or raw passwords in JSON responses. Always delete `password` before returning user payloads.

3. **Indexes**:
   - Every foreign reference field (`user_id`, `course_id`, `instructor_id`) must have an index `{ index: true }`.
   - Text search on courses must utilize a compound Text Index:
     `courseSchema.index({ title: "text", subtitle: "text", description: "text" })`.
   - Compound unique indexes must be declared for duplicate prevention:
     - Unique enrollment: `{ student_id: 1, course_id: 1 }, { unique: true }`.
     - Unique rating: `{ student_id: 1, course_id: 1 }, { unique: true }`.
     - Unique certificate: `{ student_id: 1, course_id: 1 }, { unique: true }`.
   - Token & Log TTL: `tokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })`.

4. **Transactions**:
   - Multi-document atomic operations (e.g., Enrollment + Payment + AuditLog) must utilize Mongoose sessions (`mongoose.startSession()`) with `session.withTransaction()`.

---

## 4. API Response Standards & Error Handling

All HTTP responses must strictly conform to the unified JSON envelope:

### Success Response
```json
{
  "success": true,
  "message": "Human-readable status or summary",
  "data": { ... } // or null/array
}
```

### Error Response
```json
{
  "success": false,
  "message": "User-friendly error explanation",
  "error": "Detailed error string or stack (in development only)"
}
```

### HTTP Status Codes:
- `200 OK`: Successful read or update.
- `201 Created`: Successful resource creation.
- `400 Bad Request`: Validation failure or invalid input parameters.
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Authenticated user lacks permission (e.g., student accessing admin route).
- `404 Not Found`: Requested document does not exist.
- `409 Conflict`: Duplicate entry (e.g., user email already registered).
- `500 Internal Server Error`: Unhandled exception caught by global error middleware.

---

## 5. Security & Validation Rules

1. **Input Validation**:
   - Every route that accepts request body, params, or queries must have an `express-validator` schema.
   - Always run `validateResult.middleware.js` to catch errors before entering the controller.
2. **Authentication & Authorization**:
   - Protect private routes with `authenticate` middleware (decodes JWT from `Authorization: Bearer <token>` or `req.cookies.token`).
   - Restrict role-based actions with `authorize("instructor", "admin")`.
3. **Password Security**:
   - Passwords must be hashed using `bcryptjs` with a work factor of 10 (`bcrypt.genSalt(10)`).
   - Never store plain-text passwords or log sensitive tokens.
4. **HTML Sanitization**:
   - All rich-text inputs (course descriptions, announcements, chat messages) must pass through `sanitize-html` before persistence.

---

## 6. Real-Time & Background Task Rules

1. **Socket.io Handlers**:
   - All socket connections must authenticate via JWT during handshake.
   - Socket logic must be broken into dedicated modular handlers under `backend/src/sockets/` (`message.handler.js`, `room.handler.js`, `disconnect.handler.js`).
2. **Bull Queues**:
   - Long-running or heavy operations (logging, email delivery, media cleanup, analytics calculations) must be dispatched to Bull queues.
   - Workers must be idempotent and gracefully handle connection retries.
3. **Cron Jobs**:
   - Keep cron handlers in `backend/src/cron/`. Ensure jobs can safely run in multi-instance environments without duplicate runs (use Redis locks where applicable).

---

## 7. Migration & Refactoring Checklist for AI Agents

When refactoring any SQL/Sequelize code to MongoDB/Mongoose:
1. **Never break existing API contracts**: Frontend UI expects specific property names (e.g., `id`, `title`, `instructor_id`, `ratings_count`). Ensure Mongoose schemas or virtual getters map these accurately.
2. **Remove Sequelize artifacts**: Remove all `Sequelize`, `DataTypes`, `Op`, `fn`, `col`, `literal`, `.findAll()`, `.findByPk()`, `.belongsTo()`, `.hasMany()`.
3. **Replace with idiomatic Mongoose**: Use `.find()`, `.findById()`, `.findByIdAndUpdate()`, `.aggregate()`, `.populate()`.
4. **Update Environment**: Ensure `MONGODB_URI` is documented in `.env.example` and configured in `backend/src/config/db.js`.
5. **No Ghost Code**: Delete decommissioned Sequelize migrations and models once migration verification is complete.
