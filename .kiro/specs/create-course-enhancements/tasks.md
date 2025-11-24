# Implementation Plan

- [x] 1. Create API client functions for categories


  - Create `frontend/lib/apiCalls/categories/getCategories.apiCall.js`
  - Implement function to fetch all categories from `/api/categories`
  - Create `frontend/lib/apiCalls/categories/getSubCategories.apiCall.js`
  - Implement function to fetch all subcategories or by category ID
  - Add proper error handling and response parsing
  - _Requirements: 1.1, 1.2_



- [ ] 2. Create validation utility functions
  - Create `frontend/lib/validation/courseValidation.js`
  - Implement `validateField` function with min/max/required/enum checks
  - Implement `validateCourse` function matching backend course validator rules
  - Implement `validateChapter` function matching backend chapter validator rules
  - Implement `validateLesson` function matching backend lesson validator rules
  - Implement `validateQuiz` function matching backend quiz validator rules
  - Implement `validateChapterRequirement` function to check for at least one chapter
  - Export validation rules object for reference


  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.4, 8.1, 8.2, 8.3, 8.4_

- [ ] 3. Enhance CourseDetailsForm component
  - [ ] 3.1 Add category/subcategory fetching logic
    - Import category API client functions
    - Add state for categories, subcategories, loading, and errors
    - Fetch categories on component mount


    - Fetch subcategories on component mount
    - Add loading indicators for category dropdowns
    - Add error handling with retry option
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [ ] 3.2 Implement dynamic category/subcategory dropdowns
    - Replace hardcoded categories with fetched data


    - Store category ID (not name) in courseData.category_id when category is selected
    - Filter subcategories based on selected category ID
    - Disable subcategory dropdown when no category selected
    - Clear subcategory when category changes
    - Store subcategory ID in courseData.subcategory_id when subcategory is selected
    - _Requirements: 1.3, 1.4, 6.2, 6.3, 6.5_


  - [ ] 3.3 Add new form fields
    - Add subtitle input field with placeholder and maxLength
    - Add learning_objectives textarea with placeholder and maxLength
    - Add requirements textarea with placeholder and maxLength
    - Add target_audience textarea with placeholder and maxLength
    - Update form layout for professional appearance
    - Add helpful tooltips/descriptions for new fields
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 8.2, 8.3_

  - [ ] 3.4 Implement field-level validation
    - Add validation state for all fields
    - Validate fields on blur and change events
    - Display error messages below each field
    - Highlight invalid fields visually
    - Clear errors when field is corrected
    - _Requirements: 3.9, 3.10, 7.1, 7.2, 7.3, 7.4_



- [ ] 4. Enhance CourseStructureEditor component
  - Add validation for chapter titles and descriptions
  - Display validation errors for chapters
  - Add validation for lesson titles
  - Display validation errors for lessons
  - Add validation for quiz titles and questions

  - Display validation errors for quizzes
  - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 7.1, 7.2, 7.3, 7.4_

- [ ] 5. Update main create course page
  - [ ] 5.1 Add chapter requirement validation
    - Implement `canSaveOrSubmit` function checking for at least one chapter
    - Disable save/submit buttons when no chapters exist
    - Add tooltip explaining chapter requirement

    - Display error message when attempting to save without chapters
    - Update button states when chapters are added/removed
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 5.2 Enhance form submission
    - Update course data to include new fields (subtitle, learning_objectives, requirements, target_audience, category_id, subcategory_id)
    - Ensure category_id (not category name) is sent in the request
    - Ensure subcategory_id is sent in the request
    - Run full validation before submission
    - Scroll to first error if validation fails
    - Prevent submission if validation errors exist
    - _Requirements: 1.3, 2.5, 3.10, 6.4, 7.5_

  - [ ] 5.3 Enhance upload progress and success messaging
    - Calculate chapter, lesson, and quiz counts



    - Pass detailed information to UploadProgressModal
    - Display course title in success message
    - Display chapter count in success message
    - Display lesson count in success message
    - Display quiz count in success message
    - Display status (Draft or Pending Review) in success message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 6. Update backend course validator (if needed)
  - Check if subtitle, learning_objectives, requirements, target_audience validators exist


  - Add validators for new fields if missing
  - Ensure subcategory_id validation exists
  - _Requirements: 2.5, 6.4, 8.1, 8.2, 8.3, 8.4_

- [ ] 7. Update course upload API call
  - Update `uploadCourseContent` function to include new fields
  - Ensure category_id (not category name) is sent in course creation request
  - Ensure subcategory_id is sent in course creation request
  - Ensure subtitle is sent in course creation request
  - Ensure learning_objectives is sent in course creation request
  - Ensure requirements is sent in course creation request
  - Ensure target_audience is sent in course creation request
  - _Requirements: 1.3, 2.5, 6.4_

- [ ] 8. Update UploadProgressModal component
  - Accept detailed progress information (course title, counts, status)
  - Display enhanced success message with all details
  - Add visual icons for chapters, lessons, quizzes
  - Style success message professionally
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 9. Testing and validation
  - [ ]* 9.1 Write property test for category fetching
    - **Property 1: Category fetching on load**
    - **Validates: Requirements 1.1, 1.2**
    - Test that categories and subcategories are fetched on page load

  - [ ]* 9.2 Write property test for subcategory filtering
    - **Property 2: Subcategory filtering by category**
    - **Validates: Requirements 1.3, 6.2, 6.5**
    - Test that subcategories are filtered correctly by selected category

  - [ ]* 9.3 Write property test for validation matching
    - **Property 3: Frontend validation matches backend**
    - **Validates: Requirements 3.1-3.8**
    - Generate random course data and verify frontend validation matches backend rules

  - [ ]* 9.4 Write property test for chapter requirement
    - **Property 4: Chapter requirement enforcement**
    - **Validates: Requirements 4.1, 4.2, 4.4**
    - Test that save/submit is prevented when no chapters exist

  - [ ]* 9.5 Write property test for new fields submission
    - **Property 5: New fields included in submission**
    - **Validates: Requirements 2.5, 6.4**
    - Test that all new fields are included in API request

  - [ ]* 9.6 Write unit tests for validation functions
    - Test validateField with various inputs
    - Test validateCourse with valid and invalid data
    - Test validateChapter with valid and invalid data
    - Test validateLesson with valid and invalid data
    - Test validateQuiz with valid and invalid data
    - Test validateChapterRequirement
    - _Requirements: 3.1-3.8, 4.1, 4.2_

  - [ ]* 9.7 Write integration tests
    - Test complete course creation flow with new fields
    - Test category/subcategory selection and filtering
    - Test validation error display and clearing
    - Test chapter requirement enforcement
    - Test success message display
    - _Requirements: All requirements_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
