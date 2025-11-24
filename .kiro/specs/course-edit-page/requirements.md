# Requirements Document

## Introduction

This specification defines the course edit page for instructors to modify their existing courses. The feature allows instructors to update course general information, add new chapters/lessons/quizzes, and manage course content without requiring admin approval (unless the course is pending review). The edit page will be accessible from the instructor's "My Courses" page.

## Glossary

- **Course Edit Page**: The instructor dashboard page for editing existing courses
- **General Information**: Course metadata including title, subtitle, description, category, subcategory, level, price, learning objectives, requirements, target audience, thumbnail, and intro video
- **Course Status**: The current state of a course (draft, pending_review, approved, rejected)
- **My Courses Page**: The instructor dashboard page listing all courses created by the instructor
- **Add Chapter/Lesson/Quiz**: Creating new content within an existing course structure

## Requirements

### Requirement 1

**User Story:** As an instructor, I want to access the edit page for my courses from the "My Courses" page, so that I can easily manage my course content.

#### Acceptance Criteria

1. WHEN viewing the "My Courses" page, THE My Courses Page SHALL display an "Edit" button for each course
2. WHEN clicking the "Edit" button, THE My Courses Page SHALL navigate to the course edit page with the course ID
3. WHEN the course edit page loads, THE Course Edit Page SHALL fetch the complete course data including chapters, lessons, and quizzes
4. WHEN the course data is loading, THE Course Edit Page SHALL display a loading indicator
5. WHEN the course data fails to load, THE Course Edit Page SHALL display an error message with retry option

### Requirement 2

**User Story:** As an instructor, I want to edit the general information of my course, so that I can keep course details up-to-date.

#### Acceptance Criteria

1. WHEN viewing the course edit page, THE Course Edit Page SHALL display a form with all general information fields pre-filled
2. WHEN editing the title field, THE Course Edit Page SHALL validate it matches backend rules (1-255 characters)
3. WHEN editing the subtitle field, THE Course Edit Page SHALL validate it does not exceed 500 characters
4. WHEN editing the description field, THE Course Edit Page SHALL validate it matches backend rules (1-5000 characters)
5. WHEN changing the category, THE Course Edit Page SHALL update the subcategory dropdown options
6. WHEN changing the thumbnail, THE Course Edit Page SHALL allow uploading a new image file
7. WHEN changing the intro video, THE Course Edit Page SHALL allow uploading a new video file
8. WHEN saving general information changes, THE Course Edit Page SHALL send an update request to the backend
9. WHEN the update succeeds, THE Course Edit Page SHALL display a success message
10. WHEN the update fails, THE Course Edit Page SHALL display an error message

### Requirement 3

**User Story:** As an instructor, I want to add new chapters to my course, so that I can expand my course content.

#### Acceptance Criteria

1. WHEN viewing the course structure section, THE Course Edit Page SHALL display all existing chapters
2. WHEN clicking "Add Chapter", THE Course Edit Page SHALL display a form to create a new chapter
3. WHEN creating a new chapter, THE Course Edit Page SHALL validate the title (1-255 characters) and description (0-1000 characters)
4. WHEN submitting a new chapter, THE Course Edit Page SHALL send a POST request to `/api/chapters`
5. WHEN the chapter creation succeeds, THE Course Edit Page SHALL add the new chapter to the course structure
6. WHEN the chapter creation fails, THE Course Edit Page SHALL display an error message

### Requirement 4

**User Story:** As an instructor, I want to add new lessons to existing chapters, so that I can provide more learning content.

#### Acceptance Criteria

1. WHEN viewing a chapter, THE Course Edit Page SHALL display an "Add Lesson" button
2. WHEN clicking "Add Lesson", THE Course Edit Page SHALL display a form to create a new lesson
3. WHEN creating a video lesson, THE Course Edit Page SHALL allow uploading a video file
4. WHEN creating a text lesson, THE Course Edit Page SHALL provide a text editor
5. WHEN submitting a new lesson, THE Course Edit Page SHALL send a POST request to `/api/lessons`
6. WHEN the lesson creation succeeds, THE Course Edit Page SHALL add the new lesson to the chapter
7. WHEN the lesson creation fails, THE Course Edit Page SHALL display an error message

### Requirement 5

**User Story:** As an instructor, I want to add new quizzes to existing chapters, so that I can assess student learning.

#### Acceptance Criteria

1. WHEN viewing a chapter, THE Course Edit Page SHALL display an "Add Quiz" button
2. WHEN clicking "Add Quiz", THE Course Edit Page SHALL display a form to create a new quiz
3. WHEN creating a quiz, THE Course Edit Page SHALL validate the title (3-255 characters)
4. WHEN creating a quiz, THE Course Edit Page SHALL validate each question (3-255 characters)
5. WHEN submitting a new quiz, THE Course Edit Page SHALL send a POST request to `/api/quizzes`
6. WHEN the quiz creation succeeds, THE Course Edit Page SHALL add the new quiz to the chapter
7. WHEN the quiz creation fails, THE Course Edit Page SHALL display an error message

### Requirement 6

**User Story:** As an instructor, I want editing restrictions based on course status, so that I understand when I can and cannot edit my course.

#### Acceptance Criteria

1. WHEN a course status is "pending_review", THE Course Edit Page SHALL prevent editing general information
2. WHEN a course status is "pending_review", THE Course Edit Page SHALL display a message explaining the course is under review
3. WHEN a course status is "draft", THE Course Edit Page SHALL allow all editing operations
4. WHEN a course status is "approved", THE Course Edit Page SHALL allow all editing operations
5. WHEN a course status is "rejected", THE Course Edit Page SHALL allow all editing operations

### Requirement 7

**User Story:** As an instructor, I want to see a preview of my course while editing, so that I can see how it will appear to students.

#### Acceptance Criteria

1. WHEN viewing the course edit page, THE Course Edit Page SHALL provide a "Preview" tab
2. WHEN clicking the "Preview" tab, THE Course Edit Page SHALL display the course as it appears to students
3. WHEN viewing the preview, THE Course Edit Page SHALL show the course title, subtitle, description, instructor info, and course structure
4. WHEN viewing the preview, THE Course Edit Page SHALL display the intro video if available
5. WHEN viewing the preview, THE Course Edit Page SHALL show learning objectives, requirements, and target audience

### Requirement 8

**User Story:** As a developer, I want the edit page to reuse existing components from the create page, so that the codebase is maintainable and consistent.

#### Acceptance Criteria

1. WHEN building the edit page, THE Course Edit Page SHALL reuse CourseDetailsForm component
2. WHEN building the edit page, THE Course Edit Page SHALL reuse CourseStructureEditor component
3. WHEN building the edit page, THE Course Edit Page SHALL reuse validation utilities
4. WHEN building the edit page, THE Course Edit Page SHALL adapt components to work in edit mode
5. WHEN in edit mode, THE components SHALL pre-fill fields with existing data

### Requirement 9

**User Story:** As an instructor, I want clear feedback when saving changes, so that I know my edits were successful.

#### Acceptance Criteria

1. WHEN saving general information changes, THE Course Edit Page SHALL display a loading indicator
2. WHEN changes are saved successfully, THE Course Edit Page SHALL display a success toast notification
3. WHEN changes fail to save, THE Course Edit Page SHALL display an error toast notification with details
4. WHEN adding a chapter/lesson/quiz, THE Course Edit Page SHALL display progress feedback
5. WHEN operations complete, THE Course Edit Page SHALL update the UI to reflect the changes

### Requirement 10

**User Story:** As an instructor, I want the course preview to match the actual student view, so that I can accurately assess how my course will appear.

#### Acceptance Criteria

1. WHEN viewing the preview, THE Course Edit Page SHALL use the same layout as the public course page
2. WHEN viewing the preview, THE Course Edit Page SHALL display the course thumbnail
3. WHEN viewing the preview, THE Course Edit Page SHALL show enrollment statistics (if available)
4. WHEN viewing the preview, THE Course Edit Page SHALL display the course curriculum with chapter and lesson structure
5. WHEN viewing the preview, THE Course Edit Page SHALL indicate which lessons are preview lessons
