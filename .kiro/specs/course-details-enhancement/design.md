# Design Document: Course Details Page Enhancement

## Overview

This design document outlines the enhancement of the course details page to match modern e-learning platforms like Udemy and Coursera. The page will provide a comprehensive, professional course preview experience with improved visual hierarchy, better information architecture, and an integrated rating system for enrolled students.

The enhancement focuses on:
- Professional hero section with dark gradient background
- Comprehensive course curriculum with expandable sections
- Detailed instructor profile section
- Student feedback section with rating capability
- Sticky enrollment card with pricing and features
- Related courses section
- Responsive design for all devices
- Preview lesson functionality

## Architecture

### Component Structure

```
CourseDetailsPage (Page Component)
├── HeroSection
│   ├── Breadcrumb
│   ├── CourseBadge
│   ├── CourseTitle
│   ├── CourseDescription
│   └── CourseMetadata
│       ├── InstructorInfo
│       ├── LastUpdated
│       ├── Language
│       └── StudentCount
├── MainContent (2-column layout)
│   ├── LeftColumn
│   │   ├── CourseCurriculum
│   │   │   ├── CurriculumHeader
│   │   │   └── ChapterList
│   │   │       └── ChapterItem
│   │   │           ├── ChapterHeader
│   │   │           └── LessonList
│   │   │               └── LessonItem
│   │   ├── InstructorSection
│   │   │   ├── InstructorProfile
│   │   │   ├── InstructorStats
│   │   │   └── InstructorBio
│   │   ├── StudentFeedbackSection
│   │   │   ├── FeedbackHeader (with Add Rating button)
│   │   │   ├── ReviewList
│   │   │   │   └── ReviewCard
│   │   │   └── ShowAllButton
│   │   └── RelatedCoursesSection
│   │       └── RelatedCourseCard
│   └── RightColumn (Sticky)
│       └── EnrollmentCard
│           ├── VideoPreview
│           ├── PricingSection
│           ├── ActionButtons
│           ├── GuaranteeText
│           └── CourseIncludes
├── PreviewLessonModal (Existing)
└── RatingModal (New)
    ├── StarRating
    ├── ReviewTextArea
    └── SubmitButton
```

### Data Flow

1. **Page Load**: Fetch course data including chapters, lessons, instructor info, and reviews
2. **Enrollment Check**: Verify if current user is enrolled to show/hide rating button
3. **Preview Interaction**: Open modal when preview lesson or intro video is clicked
4. **Rating Submission**: Submit rating and review, then refresh reviews list
5. **Navigation**: Handle enrollment actions and related course navigation

## Components and Interfaces

### 1. CourseDetailsPage (Main Page Component)

**Location**: `frontend/app/courses/[id]/page.js` (Enhancement)

**Props**: None (uses Next.js params)

**State**:
```javascript
{
  course: Object | null,
  loading: boolean,
  expandedChapters: { [chapterId]: boolean },
  previewModal: { isOpen: boolean, lesson: Object | null },
  showRatingModal: boolean,
  isEnrolled: boolean,
  reviews: Array<Review>,
  reviewsLoading: boolean
}
```

**Key Methods**:
- `fetchCoursePreview()`: Fetch course data
- `fetchReviews()`: Fetch course reviews
- `checkEnrollment()`: Check if user is enrolled
- `toggleChapter(chapterId)`: Toggle chapter expansion
- `openPreviewModal(lesson)`: Open preview modal
- `handleEnroll()`: Navigate to enrollment page

### 2. RatingModal Component

**Location**: `frontend/components/RatingModal.jsx` (New)

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  courseId: string,
  courseName: string,
  onSubmitSuccess: () => void
}
```

**State**:
```javascript
{
  rating: number (1-5),
  reviewText: string,
  submitting: boolean,
  error: string | null
}
```

**Features**:
- Interactive star rating (1-5 stars)
- Multi-line review text area
- Form validation
- Submit button with loading state
- Error handling and display
- Success callback to refresh reviews

### 3. ReviewCard Component

**Location**: `frontend/components/ReviewCard.jsx` (New)

**Props**:
```javascript
{
  review: {
    id: string,
    user: {
      first_name: string,
      last_name: string,
      Profile: { profile_picture_url: string | null }
    },
    rating: number,
    review_text: string,
    created_at: string
  }
}
```

**Features**:
- User avatar or initials
- User name display
- Star rating visualization
- Review date (relative time)
- Review text with proper formatting

### 4. EnrollmentCard Component

**Location**: Inline in page (could be extracted)

**Features**:
- Sticky positioning on desktop
- Course thumbnail with play overlay
- Pricing display with discount handling
- "Add to Cart" and "Enroll Now" buttons
- Money-back guarantee text
- Course includes list with icons

## Data Models

### Course Model (Extended)

```javascript
{
  id: string,
  title: string,
  description: string,
  thumbnail_url: string,
  intro_video_public_id: string,
  price: number,
  have_discount: boolean,
  discount_type: 'percentage' | 'fixed',
  discount_value: number,
  discount_start_date: string,
  discount_end_date: string,
  category: string,
  language: string,
  level: string,
  created_at: string,
  updated_at: string,
  enrollments_count: number,
  average_rating: number,
  reviews_count: number,
  User: {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    Profile: {
      profile_picture_url: string | null,
      bio: string | null,
      headline: string | null,
      instructor_rating: number,
      total_students: number,
      total_courses: number,
      total_reviews: number
    }
  },
  Chapters: Array<Chapter>
}
```

### Review Model

```javascript
{
  id: string,
  course_id: string,
  user_id: string,
  rating: number, // 1-5
  review_text: string,
  created_at: string,
  updated_at: string,
  User: {
    id: string,
    first_name: string,
    last_name: string,
    Profile: {
      profile_picture_url: string | null
    }
  }
}
```

### Chapter Model

```javascript
{
  id: string,
  title: string,
  description: string,
  order: number,
  Lessons: Array<Lesson>
}
```

### Lesson Model

```javascript
{
  id: string,
  title: string,
  description: string,
  lesson_type: 'video' | 'article' | 'quiz',
  duration: number, // in seconds
  order: number,
  is_preview: boolean,
  video_public_id: string | null,
  content: string | null,
  LessonMaterials: Array<Material>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hero section displays complete course metadata

*For any* course with valid data, the hero section should display all required metadata fields (title, description, instructor, last updated, language, student count) without missing or undefined values.

**Validates: Requirements 1.1, 1.3, 1.5**

### Property 2: Curriculum statistics match actual content

*For any* course with chapters and lessons, the displayed curriculum statistics (total sections, total lectures, total duration) should exactly match the calculated values from the actual chapter and lesson data.

**Validates: Requirements 2.1**

### Property 3: Chapter expansion state toggles correctly

*For any* chapter in the curriculum, clicking the chapter header should toggle its expansion state from collapsed to expanded or vice versa, and this state should persist until the next click.

**Validates: Requirements 2.2**

### Property 4: Preview lessons are clickable and highlighted

*For any* lesson marked with `is_preview: true`, the lesson should be rendered as clickable with blue styling and a "Preview" badge, while non-preview lessons should not be clickable.

**Validates: Requirements 2.4, 10.1**

### Property 5: Rating button visibility matches enrollment status

*For any* user viewing the course, the "Add Rating" button should be visible if and only if the user is enrolled in the course.

**Validates: Requirements 4.1, 4.2**

### Property 6: Rating submission validates input

*For any* rating submission, the system should reject submissions where rating is not between 1-5 stars or where review text exceeds maximum length.

**Validates: Requirements 4.4**

### Property 7: Reviews display in chronological order

*For any* course with multiple reviews, the reviews should be displayed with the newest review first (descending by created_at timestamp).

**Validates: Requirements 5.3**

### Property 8: Pricing displays correctly with discounts

*For any* course with an active discount, the enrollment card should display both the discounted price and the original price with strikethrough, plus a discount badge showing the discount amount or percentage.

**Validates: Requirements 6.3**

### Property 9: Enrollment card remains sticky on desktop

*For any* viewport width >= 1024px (desktop), the enrollment card should maintain sticky positioning and remain visible while scrolling through the page content.

**Validates: Requirements 6.1**

### Property 10: Related courses navigate correctly

*For any* related course card that is clicked, the system should navigate to that course's details page with the correct course ID in the URL.

**Validates: Requirements 7.4**

### Property 11: Mobile layout stacks correctly

*For any* viewport width < 1024px (mobile/tablet), the enrollment card should be positioned below the main content in the document flow, not as a sticky sidebar.

**Validates: Requirements 9.1**

### Property 12: Preview modal plays correct video

*For any* preview lesson or intro video that is clicked, the modal should open and load the video player with the correct video public ID from the lesson or course data.

**Validates: Requirements 10.3, 10.5**

## Error Handling

### API Errors

1. **Course Not Found (404)**
   - Display CourseNotFound fallback component
   - Show message: "This course doesn't exist or has been removed"
   - Provide link to browse all courses

2. **Network Errors**
   - Display error toast notification
   - Retry button for failed requests
   - Graceful degradation (show cached data if available)

3. **Reviews Fetch Failure**
   - Show empty state with message
   - Don't block page rendering
   - Retry option available

4. **Rating Submission Failure**
   - Display error message in modal
   - Keep modal open with user's input preserved
   - Allow retry without losing data

### Validation Errors

1. **Invalid Rating**
   - Highlight star rating component
   - Show error: "Please select a rating between 1 and 5 stars"

2. **Empty Review Text**
   - Highlight text area
   - Show error: "Please write a review (minimum 10 characters)"

3. **Review Too Long**
   - Show character count
   - Prevent submission
   - Show error: "Review must be less than 1000 characters"

### State Errors

1. **Unauthenticated User Attempting to Rate**
   - Redirect to login page
   - Store return URL to come back after login

2. **Non-enrolled User Attempting to Rate**
   - Show message: "You must be enrolled to rate this course"
   - Provide "Enroll Now" button

## Testing Strategy

### Unit Tests

**Framework**: Jest + React Testing Library

**Test Files**:
- `frontend/components/__tests__/RatingModal.test.js`
- `frontend/components/__tests__/ReviewCard.test.js`
- `frontend/app/courses/[id]/__tests__/page.test.js`

**Unit Test Cases**:

1. **RatingModal Component**
   - Renders with correct initial state
   - Star rating updates on click
   - Review text updates on input
   - Submit button disabled when invalid
   - Calls onSubmitSuccess after successful submission
   - Displays error messages correctly

2. **ReviewCard Component**
   - Displays user name correctly
   - Shows initials when no avatar
   - Renders correct number of filled stars
   - Formats date correctly (relative time)
   - Handles long review text with proper wrapping

3. **Course Details Page**
   - Renders loading skeleton initially
   - Displays course data after fetch
   - Shows CourseNotFound on 404
   - Toggles chapter expansion correctly
   - Opens preview modal with correct lesson
   - Shows rating button only when enrolled

### Property-Based Tests

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run minimum 100 iterations

**Property Test Cases**:

1. **Property 1: Hero section completeness**
   - Generate random course objects with all required fields
   - Verify all metadata fields are rendered without undefined values
   - **Feature: course-details-enhancement, Property 1**

2. **Property 2: Curriculum statistics accuracy**
   - Generate random course structures with varying chapters/lessons
   - Calculate expected totals independently
   - Verify displayed statistics match calculations
   - **Feature: course-details-enhancement, Property 2**

3. **Property 3: Chapter toggle consistency**
   - Generate random chapter IDs
   - Simulate toggle clicks
   - Verify state changes correctly each time
   - **Feature: course-details-enhancement, Property 3**

4. **Property 4: Preview lesson styling**
   - Generate random lesson arrays with mixed preview flags
   - Verify only preview lessons have clickable styling
   - **Feature: course-details-enhancement, Property 4**

5. **Property 5: Rating button visibility**
   - Generate random enrollment states (true/false)
   - Verify button visibility matches enrollment status
   - **Feature: course-details-enhancement, Property 5**

6. **Property 6: Rating validation**
   - Generate random rating values (including invalid ones)
   - Generate random review text (including edge cases)
   - Verify validation rejects invalid inputs
   - **Feature: course-details-enhancement, Property 6**

7. **Property 7: Review ordering**
   - Generate random review arrays with different timestamps
   - Verify reviews are sorted newest first
   - **Feature: course-details-enhancement, Property 7**

8. **Property 8: Discount pricing display**
   - Generate random courses with various discount configurations
   - Verify pricing display matches discount calculations
   - **Feature: course-details-enhancement, Property 8**

9. **Property 11: Responsive layout**
   - Test with various viewport widths
   - Verify layout changes at breakpoint (1024px)
   - **Feature: course-details-enhancement, Property 11**

10. **Property 12: Modal video loading**
    - Generate random lessons with video IDs
    - Verify modal loads correct video public ID
    - **Feature: course-details-enhancement, Property 12**

### Integration Tests

1. **End-to-End Course Preview Flow**
   - Navigate to course details page
   - Verify all sections load
   - Click preview lesson
   - Verify video plays
   - Close modal
   - Verify page state preserved

2. **Rating Submission Flow**
   - Login as enrolled student
   - Navigate to course details
   - Click "Add Rating"
   - Submit rating and review
   - Verify review appears in list

3. **Enrollment Flow**
   - Click "Enroll Now" button
   - Verify navigation to enrollment page
   - Verify course ID in URL

### Manual Testing Checklist

- [ ] Visual design matches Udemy/Coursera reference
- [ ] All animations are smooth (60fps)
- [ ] Sticky sidebar works on desktop
- [ ] Mobile layout is usable and attractive
- [ ] All interactive elements have hover states
- [ ] Loading states are clear and not jarring
- [ ] Error states are helpful and actionable
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces content correctly
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

## Implementation Notes

### Styling Approach

- Use Tailwind CSS for all styling (consistent with existing codebase)
- Follow existing color scheme and design tokens
- Ensure responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Use existing UI components from `frontend/components/ui/`

### Performance Considerations

1. **Lazy Loading**
   - Lazy load VideoPlayer component (already implemented)
   - Consider lazy loading related courses section

2. **Memoization**
   - Memoize expensive calculations (curriculum stats)
   - Use React.memo for ReviewCard components

3. **Optimistic Updates**
   - Show rating immediately after submission
   - Update UI before API confirmation
   - Rollback on error

### Accessibility

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Enter/Space to activate buttons

2. **Screen Readers**
   - Proper ARIA labels on buttons
   - Announce modal open/close
   - Describe star ratings

3. **Color Contrast**
   - Ensure WCAG AA compliance
   - Test with color blindness simulators

### API Endpoints Required

1. **GET /api/reviews/course/:courseId**
   - Fetch all reviews for a course
   - Returns: Array<Review>

2. **POST /api/reviews**
   - Submit a new review
   - Body: { course_id, rating, review_text }
   - Returns: Review object

3. **GET /api/enrollments/check/:courseId**
   - Check if current user is enrolled
   - Returns: { isEnrolled: boolean }

4. **GET /api/courses/:courseId/related**
   - Fetch related courses
   - Returns: Array<Course> (simplified)

## Future Enhancements

1. **Review Filtering and Sorting**
   - Filter by star rating
   - Sort by most helpful, newest, highest/lowest rating

2. **Review Helpfulness Voting**
   - "Was this review helpful?" buttons
   - Sort by helpfulness score

3. **Instructor Q&A Section**
   - Allow students to ask questions
   - Instructor can respond
   - Upvote/downvote questions

4. **Course Preview Video Chapters**
   - Show chapter markers in intro video
   - Jump to specific sections

5. **Wishlist Functionality**
   - Add course to wishlist
   - Heart icon in enrollment card

6. **Share Course**
   - Social media sharing buttons
   - Copy link functionality

7. **Course Comparison**
   - Compare with similar courses
   - Side-by-side feature comparison
