# Requirements Document

## Introduction

This specification defines enhancements to the course creation page to improve data integrity, user experience, and validation. The enhancements include dynamic category/subcategory fetching, comprehensive frontend validation matching backend rules, new course fields (subtitle, learning objectives, requirements, target audience), and improved success messaging.

## Glossary

- **Course Creation Page**: The instructor dashboard page for creating new courses
- **Dynamic Categories**: Categories and subcategories fetched from the database instead of hardcoded values
- **Frontend Validation**: Client-side validation that mirrors backend validation rules
- **Course Fields**: Data attributes of a course (title, description, category, subcategory, etc.)
- **Chapter Requirement**: Minimum requirement of at least one chapter before saving or submitting
- **Success Message**: Feedback displayed to user after successful course upload

## Requirements

### Requirement 1

**User Story:** As an instructor, I want to select from actual categories and subcategories in the database, so that my course is properly classified.

#### Acceptance Criteria

1. WHEN the course creation page loads, THE Course Creation Page SHALL fetch all categories from the backend API
2. WHEN the course creation page loads, THE Course Creation Page SHALL fetch all subcategories from the backend API
3. WHEN a user selects a category, THE Course Creation Page SHALL store the category ID in the course data
4. WHEN a user selects a category, THE Course Creation Page SHALL filter subcategories to show only those belonging to the selected category
5. WHEN categories are loading, THE Course Creation Page SHALL display a loading indicator in the category dropdown
6. WHEN category fetching fails, THE Course Creation Page SHALL display an error message and allow retry

### Requirement 2

**User Story:** As an instructor, I want to provide additional course information (subtitle, learning objectives, requirements, target audience), so that students have complete information about my course.

#### Acceptance Criteria

1. WHEN creating a course, THE Course Creation Page SHALL provide an input field for subtitle
2. WHEN creating a course, THE Course Creation Page SHALL provide a textarea for learning objectives
3. WHEN creating a course, THE Course Creation Page SHALL provide a textarea for requirements
4. WHEN creating a course, THE Course Creation Page SHALL provide a textarea for target audience
5. WHEN submitting the course, THE Course Creation Page SHALL include subtitle, learning_objectives, requirements, and target_audience in the API request

### Requirement 3

**User Story:** As an instructor, I want frontend validation that matches backend rules, so that I catch errors before submission.

#### Acceptance Criteria

1. WHEN entering a course title, THE Course Creation Page SHALL validate it is between 1 and 255 characters
2. WHEN entering a course description, THE Course Creation Page SHALL validate it is between 1 and 5000 characters
3. WHEN entering a subtitle, THE Course Creation Page SHALL validate it does not exceed the maximum length
4. WHEN entering a chapter title, THE Course Creation Page SHALL validate it is between 1 and 255 characters
5. WHEN entering a chapter description, THE Course Creation Page SHALL validate it does not exceed 1000 characters
6. WHEN entering a lesson title, THE Course Creation Page SHALL validate it is between 1 and 255 characters
7. WHEN entering a quiz title, THE Course Creation Page SHALL validate it is between 3 and 255 characters
8. WHEN entering quiz questions, THE Course Creation Page SHALL validate each question is between 3 and 255 characters
9. WHEN validation fails, THE Course Creation Page SHALL display specific error messages for each invalid field
10. WHEN all validations pass, THE Course Creation Page SHALL enable the submit buttons

### Requirement 4

**User Story:** As an instructor, I want to be required to add at least one chapter before saving, so that my course has meaningful content structure.

#### Acceptance Criteria

1. WHEN attempting to save as draft without chapters, THE Course Creation Page SHALL prevent the action and display an error message
2. WHEN attempting to submit for review without chapters, THE Course Creation Page SHALL prevent the action and display an error message
3. WHEN at least one chapter exists, THE Course Creation Page SHALL enable the save and submit buttons
4. WHEN the chapter requirement is not met, THE Course Creation Page SHALL display a clear message indicating at least one chapter is required
5. WHEN a chapter is added, THE Course Creation Page SHALL immediately update button states

### Requirement 5

**User Story:** As an instructor, I want detailed success feedback after uploading my course, so that I know exactly what was created.

#### Acceptance Criteria

1. WHEN a course upload completes successfully, THE Course Creation Page SHALL display a success message with course title
2. WHEN a course upload completes successfully, THE Course Creation Page SHALL display the number of chapters uploaded
3. WHEN a course upload completes successfully, THE Course Creation Page SHALL display the number of lessons uploaded
4. WHEN a course upload completes successfully, THE Course Creation Page SHALL display the number of quizzes uploaded
5. WHEN saved as draft, THE Course Creation Page SHALL indicate the course status as "Draft"
6. WHEN submitted for review, THE Course Creation Page SHALL indicate the course status as "Pending Review"

### Requirement 6

**User Story:** As an instructor, I want to include a subcategory when creating a course, so that my course is more specifically classified.

#### Acceptance Criteria

1. WHEN creating a course, THE Course Creation Page SHALL provide a subcategory selection field
2. WHEN a category is selected, THE Course Creation Page SHALL populate the subcategory dropdown with relevant options
3. WHEN no category is selected, THE Course Creation Page SHALL disable the subcategory dropdown
4. WHEN submitting the course, THE Course Creation Page SHALL include the subcategory_id in the API request
5. WHEN a subcategory is selected, THE Course Creation Page SHALL validate it belongs to the selected category

### Requirement 7

**User Story:** As a developer, I want validation error messages to be clear and actionable, so that instructors can quickly fix issues.

#### Acceptance Criteria

1. WHEN a field fails validation, THE Course Creation Page SHALL display the error message next to the field
2. WHEN multiple fields fail validation, THE Course Creation Page SHALL display all error messages simultaneously
3. WHEN a validation error is fixed, THE Course Creation Page SHALL immediately remove the error message
4. WHEN validation errors exist, THE Course Creation Page SHALL highlight the invalid fields visually
5. WHEN attempting to submit with validation errors, THE Course Creation Page SHALL scroll to the first error

### Requirement 8

**User Story:** As an instructor, I want the course creation form to be professional and user-friendly, so that I can efficiently create high-quality courses.

#### Acceptance Criteria

1. WHEN viewing the course creation form, THE Course Creation Page SHALL display fields in a logical, organized layout
2. WHEN entering multi-line text (objectives, requirements, target audience), THE Course Creation Page SHALL provide appropriately sized textareas
3. WHEN hovering over field labels, THE Course Creation Page SHALL display helpful tooltips where appropriate
4. WHEN required fields are empty, THE Course Creation Page SHALL indicate they are required
5. WHEN the form is long, THE Course Creation Page SHALL maintain good visual hierarchy and spacing
