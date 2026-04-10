# Backend Architecture Documentation

## Overview
This backend is a modular Node.js/Express application for an LMS (Learning Management System). It is structured for scalability, maintainability, and security, following best practices for modern web APIs.

---

## Main Components

### 1. Entry Point
- **server.js**: Starts the Express server, sets up HTTP and Socket.io, loads environment variables, and initializes the app.
- **src/app.js**: Main Express app configuration, middleware setup, and route mounting.

### 2. Configuration
- **config/db.js**: Database connection logic.
- **config/redis.js**: Redis connection for caching and sessions.
- **config/mailer.js**: Email service configuration.
- **config/queue.js**: Job queue setup (e.g., for background tasks).

### 3. Middlewares
- **auth.middleware.js**: Authentication and role-based authorization.
- **auditLog.middleware.js**: Logs sensitive/admin actions for auditing.
- **caching.middleware.js**: Handles caching logic (e.g., Redis).
- **error.middleware.js**: Centralized error handling.
- **logging.middleware.js**: Request/response logging.
- **upload.middleware.js**: Handles file uploads (e.g., Multer integration).
- **validateResult.middleware.js**: Express-validator result handler.

### 4. Rate Limiters
- **api.limiter.js**: General API rate limiting.
- **auth.limiter.js**: Stricter limits for auth endpoints.
- **general.limiter.js**: Global rate limiting.

### 5. Caching
- **cache.manager.js**: Central cache management.
- **redis.util.js**: Redis utility functions.

### 6. Cron Jobs
- **init.cron.js**: Initializes scheduled jobs.
- **instructorPerformance.cron.js**: Tracks instructor KPIs.
- **studentProgress.cron.js**: Tracks student progress.

### 7. Sockets
- **chat.socket.js**: Real-time chat logic (Socket.io).
- **group-chat/**: Group chat features.

### 8. Models
- Organized by domain (admin, auth, categories, etc.).
- Each folder contains Mongoose/Sequelize models for DB entities.

### 9. Controllers
- Organized by domain (admin, ai, auth, etc.).
- Each controller handles business logic for its route group.

### 10. Services
- Encapsulate business logic, reusable across controllers.
- Organized by domain.

### 11. Validators
- Input validation using express-validator.
- Organized by domain.

### 12. Utilities
- Helper functions (e.g., logging, PDF generation, sanitization, cloud storage).

### 13. Workers
- Background job processors (e.g., notifications, logging).

---

## Routing Structure
- **/api/auth/**: Authentication (register, login, password, etc.)
- **/api/courses/**: Course CRUD, chapters, lessons, quizzes, reviews, enrollments
- **/api/categories/**: Categories and subcategories
- **/api/users/**: User management, profiles, certificates
- **/api/payments/**: Payment processing
- **/api/reports/**: Reporting and analytics
- **/api/communication/**: Chat and notifications
- **/api/admin/**: Admin-only endpoints (analytics, logs, settings, etc.)
- **/api/ai/**: AI-powered features
- **/api/media/**: File uploads, cloud storage
- **/api/instructor/**: Instructor-specific analytics and course management

---

## Security
- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation and sanitization
- Audit logging for sensitive actions

---

## Extensibility
- Modular structure allows easy addition of new features.
- Clear separation of concerns (controllers, services, models, validators).

---

## Deployment
- Environment variables for secrets/configuration
- Ready for Dockerization and cloud deployment
- Supports horizontal scaling (stateless, uses Redis for sessions/caching)

---

## Additional Notes
- Follows ES Modules syntax (import/export)
- Uses async/await for all async operations
- Organized for team collaboration and maintainability

---

For further details, see the API documentation and code comments in each module.
