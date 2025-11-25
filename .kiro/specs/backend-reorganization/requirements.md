# Requirements Document

## Introduction

This document specifies the requirements for reorganizing the backend codebase of the LMS (Learning Management System) platform. The goal is to improve code organization, remove unused files, eliminate duplications, and establish a clean, scalable architecture following feature-based organization patterns. The reorganization must preserve all existing business logic and functionality while improving maintainability and developer experience.

## Glossary

- **Backend**: The Node.js/Express server application handling API requests, business logic, and database operations
- **Feature-based Organization**: Grouping code by business domain (e.g., courses, users, auth) rather than technical layer
- **Role-based Routes**: Organizing API routes by user role (admin, instructor, student) for clear access control
- **Dead Code**: Code that is never executed or files that are never imported/used
- **Circular Import**: When module A imports module B, and module B imports module A, causing potential runtime issues
- **src Directory**: The source code directory containing all application code, separating it from configuration files

## Requirements

### Requirement 1: Unused File Detection and Removal

**User Story:** As a developer, I want all unused files removed from the codebase, so that the project remains clean and maintainable.

#### Acceptance Criteria

1. WHEN analyzing the codebase THEN the system SHALL identify all files that are never imported or referenced by any other file
2. WHEN an empty file is detected THEN the system SHALL flag the file for removal
3. WHEN a file contains only dead code (functions never called) THEN the system SHALL flag the file for review
4. WHEN removing unused files THEN the system SHALL document each removed file with justification
5. WHEN the coursesApproving files (controller, service, validator, model, routes) are empty THEN the system SHALL remove all coursesApproving-related files
6. WHEN the routes/admin/ folder contains files that reference non-existent authorization.middleware.js THEN the system SHALL remove all 9 files in routes/admin/ folder as they are duplicates of admin.routes.js
7. WHEN adminAI.service.js is never imported anywhere THEN the system SHALL remove the file
8. WHEN lastRead.model.js is not imported in index.model.js and not used elsewhere THEN the system SHALL remove the file

### Requirement 2: Duplicate Code Consolidation

**User Story:** As a developer, I want duplicate utilities and services merged into shared modules, so that code maintenance is simplified.

#### Acceptance Criteria

1. WHEN logging.service.js and asyncLogging.service.js provide overlapping functionality THEN the system SHALL merge them into a single unified logging service
2. WHEN multiple files contain similar helper functions THEN the system SHALL consolidate them into shared utility modules
3. WHEN merging duplicate code THEN the system SHALL update all import statements to reference the consolidated module
4. WHEN consolidating services THEN the system SHALL preserve all existing functionality without breaking changes

### Requirement 3: Source Directory Structure Implementation

**User Story:** As a developer, I want all source code organized under a src directory, so that configuration and source files are clearly separated.

#### Acceptance Criteria

1. WHEN reorganizing the backend THEN the system SHALL create a src directory containing all application code
2. WHEN moving files to src THEN the system SHALL maintain the following structure: src/config, src/controllers, src/middlewares, src/models, src/routes, src/services, src/utils, src/validators, src/workers, src/sockets
3. WHEN the src directory is created THEN the system SHALL keep package.json, .env files, and documentation at the root level
4. WHEN moving files THEN the system SHALL update all relative import paths to reflect the new structure

### Requirement 4: Feature-based Controller Organization

**User Story:** As a developer, I want controllers organized by feature domain, so that related functionality is grouped together.

#### Acceptance Criteria

1. WHEN organizing controllers THEN the system SHALL create feature-based subdirectories: auth, course, user, admin, instructor, chat, payment, notification
2. WHEN a controller serves multiple roles THEN the system SHALL place it in the most appropriate feature directory
3. WHEN organizing admin-specific controllers THEN the system SHALL group them under src/controllers/admin/
4. WHEN organizing instructor-specific controllers THEN the system SHALL group them under src/controllers/instructor/

### Requirement 5: Role-based Route Organization

**User Story:** As a developer, I want routes organized by role and feature, so that API endpoints are easy to locate and maintain.

#### Acceptance Criteria

1. WHEN organizing admin routes THEN the system SHALL create src/routes/admin/ with separate files for each feature (users.routes.js, courses.routes.js, analytics.routes.js, categories.routes.js, coupons.routes.js, settings.routes.js, instructors.routes.js, marketing.routes.js, notifications.routes.js, logs.routes.js, reports.routes.js, financial.routes.js)
2. WHEN organizing instructor routes THEN the system SHALL create src/routes/instructor/ with separate files for each feature (courses.routes.js, analytics.routes.js, earnings.routes.js)
3. WHEN organizing public/shared routes THEN the system SHALL place them in src/routes/ root (auth.routes.js, courses.routes.js, categories.routes.js)
4. WHEN the admin.routes.js file exceeds 300 lines THEN the system SHALL split it into feature-specific route files
5. WHEN creating route index files THEN the system SHALL provide aggregated exports for easy importing

### Requirement 6: Import Path Optimization

**User Story:** As a developer, I want clean and consistent import paths, so that code is readable and maintainable.

#### Acceptance Criteria

1. WHEN updating import paths THEN the system SHALL use consistent relative path patterns
2. WHEN a circular import is detected THEN the system SHALL refactor the code to eliminate the circular dependency
3. WHEN modules are imported multiple times in a file THEN the system SHALL consolidate to a single import statement
4. WHEN the reorganization is complete THEN the system SHALL verify all imports resolve correctly

### Requirement 7: Entry Point Updates

**User Story:** As a developer, I want the application entry points updated to reflect the new structure, so that the application starts correctly.

#### Acceptance Criteria

1. WHEN the src directory is created THEN the system SHALL update server.js to import from the new paths
2. WHEN app.js is moved to src THEN the system SHALL update all route imports to use the new structure
3. WHEN the reorganization is complete THEN the system SHALL verify the application starts without errors
4. WHEN updating package.json THEN the system SHALL update the main entry point if necessary

### Requirement 8: Documentation of Changes

**User Story:** As a developer, I want comprehensive documentation of all changes made, so that the team understands the new structure.

#### Acceptance Criteria

1. WHEN the reorganization is complete THEN the system SHALL provide a list of all removed files with justification
2. WHEN files are merged THEN the system SHALL document which files were consolidated and why
3. WHEN the new structure is finalized THEN the system SHALL provide a complete directory tree of the reorganized backend
4. WHEN changes are made THEN the system SHALL list all files that were moved or renamed

### Requirement 9: Functionality Preservation

**User Story:** As a developer, I want all existing functionality preserved after reorganization, so that the application continues to work correctly.

#### Acceptance Criteria

1. WHEN reorganizing code THEN the system SHALL NOT modify any business logic
2. WHEN moving files THEN the system SHALL preserve all exports and their signatures
3. WHEN updating imports THEN the system SHALL maintain all existing dependencies
4. WHEN the reorganization is complete THEN the system SHALL ensure all API endpoints remain functional
5. WHEN environment variables are used THEN the system SHALL preserve all configuration references

### Requirement 10: Batch Upload Feature Integration

**User Story:** As a developer, I want the batch upload feature properly integrated into the new structure, so that the feature is available and organized correctly.

#### Acceptance Criteria

1. WHEN reorganizing the backend THEN the system SHALL keep all batch upload feature files (controller, service, routes, model)
2. WHEN moving batch upload files THEN the system SHALL place them in the appropriate feature directories under the new structure
3. WHEN the reorganization is complete THEN the system SHALL uncomment and properly integrate the batch upload routes in app.js
4. WHEN integrating batch upload THEN the system SHALL place routes under src/routes/instructor/batch-upload.routes.js

### Requirement 11: Instructor Routes Organization

**User Story:** As a developer, I want instructor routes organized by feature, so that instructor-specific endpoints are easy to locate and maintain.

#### Acceptance Criteria

1. WHEN organizing instructor routes THEN the system SHALL create src/routes/instructor/ with separate files for each feature (courses.routes.js, analytics.routes.js, earnings.routes.js, batch-upload.routes.js)
2. WHEN splitting instructor routes THEN the system SHALL group analytics-related endpoints in analytics.routes.js
3. WHEN splitting instructor routes THEN the system SHALL group course management endpoints in courses.routes.js
4. WHEN importing instructor routes in app.js THEN the system SHALL import each route file individually without using an index aggregator file
