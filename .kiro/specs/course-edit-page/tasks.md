# Implementation Plan

- [x] 1. Create API client functions for course editing




  - Create `frontend/lib/apiCalls/courses/getCourseForEdit.apiCall.js` to fetch course data by ID
  - Create `frontend/lib/apiCalls/courses/updateCourseInfo.apiCall.js` to update general course information
  - Create `frontend/lib/apiCalls/courses/updateCourseThumbnail.apiCall.js` to update course thumbnail


  - Add proper error handling and response parsing for all functions
  - _Requirements: 1.3, 2.8_



- [ ] 2. Enhance CourseDetailsForm for edit mode
  - Add `mode` prop to CourseDetailsForm component ("create" or "edit")


  - Add `onSave` prop for handling save operations in edit mode
  - Add "Save Changes" button that appears only in edit mode
  - Implement status-based field disabling (disable when pending_review)
  - Add alert message when course is pending review
  - Pre-fill all fields with existing course data in edit mode
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 6.1, 6.2, 8.1, 8.4, 8.5_

- [ ] 3. Enhance CourseStructureEditor for edit mode
  - Add `mode` prop to CourseStructureEditor component
  - Add `onAddChapter`, `onAddLesson`, `onAddQuiz` props for handling additions
  - Display existing chapters/lessons/quizzes from course data
  - Implement "Add Chapter" functionality that calls API
  - Implement "Add Lesson" functionality that calls API



  - Implement "Add Quiz" functionality that calls API
  - Show loading states during API calls


  - Update UI immediately after successful additions



  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.2, 8.4, 8.5_

- [ ] 4. Enhance CoursePreview to match student view
  - Update CoursePreview to display learning_objectives if available
  - Update CoursePreview to display requirements if available
  - Update CoursePreview to display target_audience if available
  - Display intro video in preview if available

  - Show instructor information in preview
  - Match layout and styling to actual public course page
  - Display proper course statistics (chapters, lessons, quizzes)
  - _Requirements: 7.3, 7.4, 7.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5. Create course edit page
  - Create `frontend/app/(dashboard)/dashboard/instructor/courses/[id]/edit/page.js`
  - Implement course data fetching on page load using course ID from params
  - Add loading state while fetching course data
  - Add error state with retry option if fetch fails
  - Implement authorization check (verify user is the instructor)

  - Create three tabs: Course Details, Course Structure, Preview
  - Integrate enhanced CourseDetailsForm in Details tab
  - Integrate enhanced CourseStructureEditor in Structure tab
  - Integrate enhanced CoursePreview in Preview tab
  - _Requirements: 1.3, 1.4, 1.5, 7.1, 7.2, 8.1, 8.2, 8.3_

- [ ] 6. Implement general information update handler
  - Create `handleUpdateGeneralInfo` function in edit page
  - Check course status before allowing updates
  - Call updateCourseInfo API with updated data
  - Handle thumbnail upload separately if changed
  - Handle intro video upload separately if changed
  - Display loading indicator during save
  - Show success toast on successful update


  - Show error toast on failure
  - Update local course data state after successful save


  - _Requirements: 2.8, 2.9, 2.10, 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3_

- [ ] 7. Implement chapter/lesson/quiz addition handlers
  - Create `handleAddChapter` function that calls POST /api/chapters
  - Create `handleAddLesson` function that calls POST /api/lessons
  - Create `handleAddQuiz` function that calls POST /api/quizzes
  - Validate data before API calls
  - Handle video upload for video lessons
  - Display progress feedback during operations
  - Update course structure in state after successful additions
  - Show success/error toasts for each operation
  - _Requirements: 3.4, 3.5, 3.6, 4.5, 4.6, 4.7, 5.5, 5.6, 5.7, 9.4, 9.5_

- [ ] 8. Add Edit button to My Courses page
  - Locate or create the My Courses page component
  - Add "Edit" button to each course card
  - Link Edit button to `/dashboard/instructor/courses/[id]/edit`
  - Style button appropriately
  - Add icon to Edit button (Edit/Pencil icon)
  - _Requirements: 1.1, 1.2_

- [ ] 9. Update backend to remove review requirement for edits
  - Check `backend/services/course.service.js` updateCourse function
  - Verify that editing approved courses doesn't change status
  - Ensure editing doesn't trigger re-review
  - Document that only pending_review courses cannot be edited
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Testing and validation
  - [ ]* 10.1 Write property test for course data fetching
    - **Property 1: Course data fetching**
    - **Validates: Requirements 1.3, 1.4**
    - Test that course data is fetched and displayed correctly

  - [ ]* 10.2 Write property test for status restrictions
    - **Property 2: Status-based editing restrictions**
    - **Validates: Requirements 6.1, 6.2**
    - Test that pending_review courses cannot be edited

  - [ ]* 10.3 Write property test for general info updates
    - **Property 3: General information updates**
    - **Validates: Requirements 2.8, 2.9**
    - Test that updates are saved and reflected in UI

  - [ ]* 10.4 Write property test for content additions
    - **Property 4, 5, 6: Chapter/Lesson/Quiz addition**
    - **Validates: Requirements 3.4, 3.5, 4.5, 4.6, 5.5, 5.6**
    - Test that new content is created via API and added to structure

  - [ ]* 10.5 Write integration tests
    - Test complete edit flow from My Courses to Edit Page
    - Test updating general information end-to-end
    - Test adding chapters/lessons/quizzes
    - Test preview display accuracy
    - Test navigation between tabs
    - _Requirements: All requirements_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
