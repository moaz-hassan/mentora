# Implementation Plan

- [x] 1. Remove unused and empty files



  - [x] 1.1 Delete empty coursesApproving files


    - Delete `controllers/coursesApproving.controller.js`
    - Delete `services/coursesApproving.service.js`
    - Delete `validators/coursesApproving.validator.js`
    - Delete `models/coursesApproving.model.js`
    - Delete `routes/coursesApproving.routes.js`
    - _Requirements: 1.2, 1.5_



  - [ ] 1.2 Delete unused service and model files
    - Delete `services/adminAI.service.js` (never imported)


    - Delete `models/lastRead.model.js` (not in index.model.js)
    - _Requirements: 1.1, 1.7, 1.8_

  - [ ] 1.3 Delete duplicate routes/admin/ folder files
    - Delete `routes/admin/analytics.routes.js`
    - Delete `routes/admin/category.routes.js`
    - Delete `routes/admin/coupon.routes.js`
    - Delete `routes/admin/financial.routes.js`
    - Delete `routes/admin/instructorManagement.routes.js`
    - Delete `routes/admin/logs.routes.js`

    - Delete `routes/admin/marketing.routes.js`


    - Delete `routes/admin/platformAnalytics.routes.js`
    - Delete `routes/admin/settings.routes.js`
    - Remove empty `routes/admin/` directory
    - _Requirements: 1.1, 1.6_

- [ ] 2. Create src directory structure
  - [ ] 2.1 Create src directory and subdirectories
    - Create `src/` directory
    - Create `src/config/`
    - Create `src/controllers/`
    - Create `src/controllers/admin/`
    - Create `src/controllers/instructor/`
    - Create `src/middlewares/`
    - Create `src/models/`
    - Create `src/routes/`
    - Create `src/routes/admin/`
    - Create `src/routes/instructor/`
    - Create `src/routes/auth/`
    - Create `src/routes/courses/`
    - Create `src/routes/categories/`
    - Create `src/routes/users/`
    - Create `src/routes/payments/`
    - Create `src/routes/communication/`
    - Create `src/routes/media/`



    - Create `src/routes/ai/`


    - Create `src/routes/reports/`
    - Create `src/services/`
    - Create `src/sockets/`

    - Create `src/utils/`


    - Create `src/validators/`




    - Create `src/workers/`
    - _Requirements: 3.1, 3.2_

- [ ] 3. Move config files to src/config
  - [ ] 3.1 Move all config files
    - Move `config/db.js` to `src/config/db.js`
    - Move `config/mailer.js` to `src/config/mailer.js`
    - Move `config/queue.js` to `src/config/queue.js`
    - Move `config/redis.js` to `src/config/redis.js`
    - Move `config/socket.js` to `src/config/socket.js`
    - _Requirements: 3.2_

- [ ] 4. Move and organize controllers
  - [ ] 4.1 Move shared controllers to src/controllers
    - Move `controllers/auth.controller.js` to `src/controllers/auth.controller.js`
    - Move `controllers/category.controller.js` to `src/controllers/category.controller.js`

    - Move `controllers/certificate.controller.js` to `src/controllers/certificate.controller.js`
    - Move `controllers/chapter.controller.js` to `src/controllers/chapter.controller.js`
    - Move `controllers/chat.controller.js` to `src/controllers/chat.controller.js`


    - Move `controllers/cloudinary.controller.js` to `src/controllers/cloudinary.controller.js`
    - Move `controllers/course.controller.js` to `src/controllers/course.controller.js`
    - Move `controllers/enrollment.controller.js` to `src/controllers/enrollment.controller.js`
    - Move `controllers/lesson.controller.js` to `src/controllers/lesson.controller.js`

    - Move `controllers/lessonMaterial.controller.js` to `src/controllers/lessonMaterial.controller.js`
    - Move `controllers/notification.controller.js` to `src/controllers/notification.controller.js`
    - Move `controllers/payment.controller.js` to `src/controllers/payment.controller.js`
    - Move `controllers/profile.controller.js` to `src/controllers/profile.controller.js`




    - Move `controllers/quiz.controller.js` to `src/controllers/quiz.controller.js`
    - Move `controllers/report.controller.js` to `src/controllers/report.controller.js`
    - Move `controllers/review.controller.js` to `src/controllers/review.controller.js`

    - Move `controllers/subCategory.controller.js` to `src/controllers/subCategory.controller.js`




    - Move `controllers/user.controller.js` to `src/controllers/user.controller.js`
    - Move `controllers/ai.controller.js` to `src/controllers/ai.controller.js`
    - Move `controllers/coupon.controller.js` to `src/controllers/coupon.controller.js`

    - _Requirements: 4.1, 4.2_


  - [x] 4.2 Move admin controllers to src/controllers/admin

    - Move `controllers/adminAnalytics.controller.js` to `src/controllers/admin/analytics.controller.js`




    - Move `controllers/instructorManagement.controller.js` to `src/controllers/admin/instructors.controller.js`

    - Move `controllers/logs.controller.js` to `src/controllers/admin/logs.controller.js`

    - Move `controllers/marketing.controller.js` to `src/controllers/admin/marketing.controller.js`


    - Move `controllers/platformAnalytics.controller.js` to `src/controllers/admin/platformAnalytics.controller.js`
    - Move `controllers/settings.controller.js` to `src/controllers/admin/settings.controller.js`
    - Move `controllers/financial.controller.js` to `src/controllers/admin/financial.controller.js`


    - _Requirements: 4.3_






  - [ ] 4.3 Move instructor controllers to src/controllers/instructor
    - Move `controllers/instructor.controller.js` to `src/controllers/instructor/courses.controller.js`
    - Move `controllers/analytics.controller.js` to `src/controllers/instructor/analytics.controller.js`

    - Move `controllers/batchUpload.controller.js` to `src/controllers/instructor/batchUpload.controller.js`

    - _Requirements: 4.4_

- [ ] 5. Move middlewares to src/middlewares
  - [ ] 5.1 Move all middleware files
    - Move `middlewares/auditLog.middleware.js` to `src/middlewares/auditLog.middleware.js`
    - Move `middlewares/auth.middleware.js` to `src/middlewares/auth.middleware.js`
    - Move `middlewares/error.middleware.js` to `src/middlewares/error.middleware.js`
    - Move `middlewares/logging.middleware.js` to `src/middlewares/logging.middleware.js`

    - Move `middlewares/upload.middleware.js` to `src/middlewares/upload.middleware.js`



    - Move `middlewares/validateResult.middleware.js` to `src/middlewares/validateResult.middleware.js`
    - _Requirements: 3.2_



- [x] 6. Move models to src/models

  - [ ] 6.1 Move all model files
    - Move all model files from `models/` to `src/models/`
    - Rename `index.model.js` to `index.js`
    - _Requirements: 3.2_


- [ ] 7. Merge and move services
  - [ ] 7.1 Merge logging services
    - Merge `services/asyncLogging.service.js` into `services/logging.service.js`
    - Update all imports that reference asyncLogging.service.js

    - _Requirements: 2.1, 2.3_



  - [x] 7.2 Move all services to src/services

    - Move all service files from `services/` to `src/services/`

    - _Requirements: 3.2_


- [ ] 8. Split and move admin routes
  - [ ] 8.1 Create admin route files from admin.routes.js
    - Create `src/routes/admin/analytics.routes.js` with analytics endpoints
    - Create `src/routes/admin/categories.routes.js` with category endpoints

    - Create `src/routes/admin/coupons.routes.js` with coupon endpoints
    - Create `src/routes/admin/courses.routes.js` with course review endpoints
    - Create `src/routes/admin/financial.routes.js` with financial endpoints


    - Create `src/routes/admin/instructors.routes.js` with instructor management endpoints
    - Create `src/routes/admin/logs.routes.js` with log endpoints

    - Create `src/routes/admin/marketing.routes.js` with marketing endpoints
    - Create `src/routes/admin/notifications.routes.js` with notification endpoints



    - Create `src/routes/admin/reports.routes.js` with report endpoints
    - Create `src/routes/admin/settings.routes.js` with settings endpoints
    - Create `src/routes/admin/users.routes.js` with user management endpoints

    - _Requirements: 5.1, 5.4_



- [ ] 9. Split and move instructor routes
  - [ ] 9.1 Create instructor route files
    - Create `src/routes/instructor/courses.routes.js` with course management endpoints

    - Create `src/routes/instructor/analytics.routes.js` with analytics endpoints


    - Create `src/routes/instructor/batch-upload.routes.js` from batchUpload.routes.js

    - _Requirements: 5.2, 11.1, 11.2, 11.3_

- [x] 10. Organize routes by feature

  - [ ] 10.1 Create feature route directories
    - Create `src/routes/auth/`

    - Create `src/routes/courses/`


    - Create `src/routes/categories/`
    - Create `src/routes/users/`

    - Create `src/routes/payments/`


    - Create `src/routes/communication/`
    - Create `src/routes/media/`


    - Create `src/routes/ai/`



    - Create `src/routes/reports/`
    - _Requirements: 5.3_



  - [x] 10.2 Move auth routes

    - Move `routes/auth.routes.js` to `src/routes/auth/auth.routes.js`

    - _Requirements: 5.3_


  - [x] 10.3 Move course-related routes


    - Move `routes/course.routes.js` to `src/routes/courses/course.routes.js`
    - Move `routes/chapter.routes.js` to `src/routes/courses/chapter.routes.js`


    - Move `routes/lesson.routes.js` to `src/routes/courses/lesson.routes.js`




    - Move `routes/lessonMaterial.routes.js` to `src/routes/courses/lessonMaterial.routes.js`
    - Move `routes/quiz.routes.js` to `src/routes/courses/quiz.routes.js`
    - Move `routes/review.routes.js` to `src/routes/courses/review.routes.js`
    - Move `routes/enrollment.routes.js` to `src/routes/courses/enrollment.routes.js`
    - _Requirements: 5.3_




  - [ ] 10.4 Move category routes
    - Move `routes/category.routes.js` to `src/routes/categories/category.routes.js`


    - Move `routes/subCategory.routes.js` to `src/routes/categories/subCategory.routes.js`

    - _Requirements: 5.3_

  - [x] 10.5 Move user-related routes

    - Move `routes/user.routes.js` to `src/routes/users/user.routes.js`
    - Move `routes/profile.routes.js` to `src/routes/users/profile.routes.js`
    - Move `routes/certificate.routes.js` to `src/routes/users/certificate.routes.js`

    - _Requirements: 5.3_

  - [ ] 10.6 Move payment routes
    - Move `routes/payment.routes.js` to `src/routes/payments/payment.routes.js`
    - Move `routes/coupon.routes.js` to `src/routes/payments/coupon.routes.js`
    - _Requirements: 5.3_







  - [x] 10.7 Move communication routes

    - Move `routes/chat.routes.js` to `src/routes/communication/chat.routes.js`
    - Move `routes/notification.routes.js` to `src/routes/communication/notification.routes.js`
    - _Requirements: 5.3_


  - [ ] 10.8 Move media routes
    - Move `routes/cloudinary.routes.js` to `src/routes/media/cloudinary.routes.js`

    - _Requirements: 5.3_


  - [x] 10.9 Move AI routes


    - Move `routes/ai.routes.js` to `src/routes/ai/ai.routes.js`
    - _Requirements: 5.3_

  - [ ] 10.10 Move report routes
    - Move `routes/report.routes.js` to `src/routes/reports/report.routes.js`
    - _Requirements: 5.3_

- [ ] 11. Move utils, validators, workers, and sockets
  - [ ] 11.1 Move utility files
    - Move all files from `utils/` to `src/utils/`

    - _Requirements: 3.2_

  - [ ] 11.2 Move validator files
    - Move all files from `validators/` to `src/validators/`
    - _Requirements: 3.2_

  - [ ] 11.3 Move worker files
    - Move all files from `workers/` to `src/workers/`
    - _Requirements: 3.2_

  - [ ] 11.4 Move socket files
    - Move `sockets/chat.socket.js` to `src/sockets/chat.socket.js`
    - _Requirements: 3.2_

- [ ] 12. Update app.js and move to src
  - [ ] 12.1 Update app.js with new imports and move to src
    - Update all import paths to use new structure
    - Import admin routes from individual files in src/routes/admin/
    - Import instructor routes from individual files in src/routes/instructor/
    - Uncomment and integrate batch upload routes
    - Move `app.js` to `src/app.js`
    - _Requirements: 7.2, 10.3, 10.4, 11.4_

- [ ] 13. Update server.js entry point
  - [ ] 13.1 Update server.js to import from src
    - Update import path for app.js to `./src/app.js`
    - Update import path for db.js to `./src/config/db.js`
    - _Requirements: 7.1, 7.4_

- [ ] 14. Update all import paths in moved files
  - [ ] 14.1 Update imports in controllers
    - Update all relative imports in controller files
    - _Requirements: 3.4, 6.1_

  - [ ] 14.2 Update imports in services
    - Update all relative imports in service files
    - _Requirements: 3.4, 6.1_

  - [ ] 14.3 Update imports in routes
    - Update all relative imports in route files
    - _Requirements: 3.4, 6.1_

  - [ ] 14.4 Update imports in models
    - Update all relative imports in model files
    - _Requirements: 3.4, 6.1_

  - [ ] 14.5 Update imports in middlewares
    - Update all relative imports in middleware files
    - _Requirements: 3.4, 6.1_

  - [ ] 14.6 Update imports in validators
    - Update all relative imports in validator files
    - _Requirements: 3.4, 6.1_

  - [ ] 14.7 Update imports in workers
    - Update all relative imports in worker files
    - _Requirements: 3.4, 6.1_

  - [ ] 14.8 Update imports in utils
    - Update all relative imports in utility files
    - _Requirements: 3.4, 6.1_

- [ ] 15. Clean up old directories
  - [ ] 15.1 Remove old empty directories
    - Remove empty `controllers/` directory
    - Remove empty `services/` directory
    - Remove empty `routes/` directory
    - Remove empty `models/` directory
    - Remove empty `middlewares/` directory
    - Remove empty `validators/` directory
    - Remove empty `workers/` directory
    - Remove empty `sockets/` directory
    - Remove empty `utils/` directory
    - Remove empty `config/` directory
    - _Requirements: 3.2_

- [ ] 16. Checkpoint - Verify application starts
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 17. Write property tests for reorganization verification
  - [ ]* 17.1 Write property test for import resolution
    - **Property 1: Import Resolution Integrity**
    - **Validates: Requirements 3.4, 6.4, 9.3**

  - [ ]* 17.2 Write property test for export preservation
    - **Property 2: Export Signature Preservation**
    - **Validates: Requirements 2.4, 9.2**

  - [ ]* 17.3 Write property test for circular dependencies
    - **Property 3: No Circular Dependencies**
    - **Validates: Requirements 6.2**

  - [ ]* 17.4 Write property test for API endpoint preservation
    - **Property 4: API Endpoint Preservation**
    - **Validates: Requirements 9.4**

- [ ] 18. Final Checkpoint - Verify all functionality
  - Ensure all tests pass, ask the user if questions arise.
