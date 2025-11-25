# Implementation Plan

- [x] 1. Create RatingModal component




  - Create new component at `frontend/components/RatingModal.jsx`
  - Implement interactive star rating (1-5 stars with hover and click states)
  - Add review text area with character count
  - Implement form validation (rating required, review text 10-1000 chars)
  - Add submit button with loading state
  - Implement error handling and display
  - Add modal open/close animations
  - Style with Tailwind CSS matching existing modal patterns
  - _Requirements: 4.3, 4.4_

- [ ]* 1.1 Write property test for rating validation
  - **Property 6: Rating validation**
  - **Validates: Requirements 4.4**

- [x] 2. Create ReviewCard component


  - Create new component at `frontend/components/ReviewCard.jsx`
  - Display user avatar or initials with colored background
  - Show user full name from first_name and last_name
  - Render star rating visualization (filled/empty stars)
  - Format and display review date as relative time (e.g., "2 weeks ago")
  - Display review text with proper line breaks and formatting
  - Style with Tailwind CSS for clean card appearance
  - _Requirements: 5.1, 5.2_

- [ ]* 2.1 Write unit tests for ReviewCard component
  - Test user name display
  - Test initials fallback when no avatar
  - Test star rating rendering
  - Test date formatting
  - _Requirements: 5.1, 5.2_

- [x] 3. Create API service for reviews


  - Create `frontend/lib/apiCalls/reviews/submitReview.apiCall.js`
  - Implement POST request to `/api/reviews` endpoint
  - Handle authentication token in request headers
  - Implement error handling for network failures
  - Return formatted response or throw descriptive error
  - _Requirements: 4.4_

- [x] 4. Create API service for enrollment check


  - Create `frontend/lib/apiCalls/enrollments/checkEnrollment.apiCall.js`
  - Implement GET request to `/api/enrollments/check/:courseId`
  - Handle authentication token in request headers
  - Return boolean enrollment status
  - _Requirements: 4.1, 4.2_

- [x] 5. Enhance course details page - Hero section


  - Update `frontend/app/courses/[id]/page.js` hero section
  - Implement dark gradient background (from-gray-900 to-gray-800)
  - Add breadcrumb navigation (Home > Category > Course Title)
  - Ensure course badge displays prominently
  - Display last updated date in correct format (MM/YYYY)
  - Show language and student count with icons
  - Ensure instructor info displays with avatar/initials
  - Make hero section responsive for mobile devices
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 5.1 Write property test for hero section completeness
  - **Property 1: Hero section displays complete course metadata**
  - **Validates: Requirements 1.1, 1.3, 1.5**

- [x] 6. Enhance course curriculum section

  - Update curriculum section in course details page
  - Display accurate statistics (sections, lectures, total duration)
  - Ensure chapter expansion/collapse works smoothly
  - Style preview lessons with blue color and "Preview" badge
  - Make preview lessons clickable to open modal
  - Display lesson duration for each lesson
  - Show downloadable resources indicator when materials exist
  - Ensure mobile-friendly touch targets
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 6.1 Write property test for curriculum statistics
  - **Property 2: Curriculum statistics match actual content**
  - **Validates: Requirements 2.1**

- [ ]* 6.2 Write property test for chapter toggle
  - **Property 3: Chapter expansion state toggles correctly**
  - **Validates: Requirements 2.2**

- [ ]* 6.3 Write property test for preview lesson styling
  - **Property 4: Preview lessons are clickable and highlighted**
  - **Validates: Requirements 2.4, 10.1**

- [x] 7. Enhance instructor section

  - Update instructor section in course details page
  - Display large instructor avatar (96x96) or initials
  - Show instructor name and headline
  - Display instructor statistics (rating, reviews, students, courses)
  - Show instructor bio with proper formatting
  - Use icons for each statistic (Star, Award, Users, PlayCircle)
  - Style as clean white card with proper spacing
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8. Implement student feedback section with reviews

  - Add state for reviews and reviewsLoading
  - Implement fetchReviews() function using getCourseReviews API
  - Implement checkEnrollment() function to determine if user is enrolled
  - Display "Add Rating" button only when user is enrolled
  - Render ReviewCard components for each review
  - Sort reviews by created_at descending (newest first)
  - Implement "Show all reviews" button (initially show 3-5 reviews)
  - Handle empty state when no reviews exist
  - Handle loading state while fetching reviews
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 8.1 Write property test for rating button visibility
  - **Property 5: Rating button visibility matches enrollment status**
  - **Validates: Requirements 4.1, 4.2**

- [ ]* 8.2 Write property test for review ordering
  - **Property 7: Reviews display in chronological order**
  - **Validates: Requirements 5.3**

- [x] 9. Integrate RatingModal with course page

  - Add showRatingModal state to course details page
  - Connect "Add Rating" button to open modal
  - Pass courseId and courseName props to RatingModal
  - Implement onSubmitSuccess callback to refresh reviews
  - Handle modal close and cleanup
  - Show success toast after rating submission
  - Handle errors from rating submission
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 10. Enhance enrollment card

  - Update enrollment card styling and layout
  - Ensure sticky positioning on desktop (lg:sticky lg:top-4)
  - Display course thumbnail with play button overlay
  - Implement click handler for thumbnail to play intro video
  - Display pricing with discount handling (show both prices if discounted)
  - Show discount badge when active discount exists
  - Style "Add to Cart" button as primary purple
  - Style "Enroll Now" button as outline
  - Display "30-Day Money-Back Guarantee" text
  - Show "This course includes" section with icons
  - List all course features (video duration, resources, lifetime access, mobile access, certificate)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 10.1 Write property test for pricing display
  - **Property 8: Pricing displays correctly with discounts**
  - **Validates: Requirements 6.3**

- [ ]* 10.2 Write property test for sticky positioning
  - **Property 9: Enrollment card remains sticky on desktop**
  - **Validates: Requirements 6.1**

- [x] 11. Implement related courses section

  - Add related courses section at bottom of left column
  - Create API call to fetch related courses (or use mock data initially)
  - Display 2-4 related courses in grid layout
  - Show course thumbnail, title, instructor, rating, and price for each
  - Implement hover effect (shadow-md transition)
  - Make cards clickable to navigate to course details
  - Handle empty state (hide section if no related courses)
  - Ensure responsive grid (1 column on mobile, 2 on desktop)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 11.1 Write property test for related course navigation
  - **Property 10: Related courses navigate correctly**
  - **Validates: Requirements 7.4**

- [x] 12. Implement responsive design

  - Test page on mobile viewport (< 1024px)
  - Ensure enrollment card stacks below content on mobile
  - Adjust hero section font sizes for mobile
  - Ensure curriculum section is touch-friendly
  - Make related courses show 1 per row on mobile
  - Test all interactive elements on touch devices
  - Verify all content is accessible and readable
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 12.1 Write property test for mobile layout
  - **Property 11: Mobile layout stacks correctly**
  - **Validates: Requirements 9.1**

- [x] 13. Enhance preview functionality

  - Ensure preview lessons show "Preview" badge
  - Verify preview lesson click opens PreviewLessonModal
  - Ensure intro video click opens modal with intro video
  - Verify video player loads correct video public ID
  - Test modal close functionality
  - Ensure video stops playing when modal closes
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 13.1 Write property test for preview modal video loading
  - **Property 12: Preview modal plays correct video**
  - **Validates: Requirements 10.3, 10.5**

- [x] 14. Implement error handling and loading states


  - Add CoursePageSkeleton for initial loading
  - Show CourseNotFound component on 404 error
  - Handle network errors with toast notifications
  - Implement retry functionality for failed requests
  - Handle reviews fetch failure gracefully
  - Show error states in RatingModal
  - Preserve user input on submission errors
  - Add loading spinners for async operations
  - _Requirements: All requirements (error handling)_

- [x] 15. Add accessibility features


  - Ensure all interactive elements are keyboard accessible
  - Add proper ARIA labels to buttons and icons
  - Ensure logical tab order throughout page
  - Add screen reader announcements for modal open/close
  - Describe star ratings for screen readers
  - Test with keyboard navigation only
  - Verify color contrast meets WCAG AA standards
  - _Requirements: All requirements (accessibility)_

- [ ]* 15.1 Write unit tests for accessibility
  - Test keyboard navigation
  - Test ARIA labels
  - Test screen reader compatibility
  - _Requirements: All requirements (accessibility)_

- [x] 16. Final checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.
