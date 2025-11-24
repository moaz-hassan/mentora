# Design Document

## Overview

This design document outlines the implementation of the course edit page for instructors. The page allows instructors to update course general information, add new chapters/lessons/quizzes, and preview their course as it appears to students. The implementation reuses existing components from the create course page and integrates with existing backend APIs.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              My Courses Page (Instructor Dashboard)          │
│  - List of instructor's courses                             │
│  - Edit button for each course                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Course Edit Page                            │
│  - Fetch course data by ID                                   │
│  - Tabs: Edit Details | Edit Structure | Preview           │
│  - Reuse CourseDetailsForm (edit mode)                     │
│  - Reuse CourseStructureEditor (add-only mode)             │
│  - Enhanced CoursePreview (student view)                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Endpoints                             │
│  - GET /api/courses/:id (fetch course data)                │
│  - PUT /api/courses/:id (update general info)              │
│  - POST /api/chapters (add new chapter)                    │
│  - POST /api/lessons (add new lesson)                      │
│  - POST /api/quizzes (add new quiz)                        │
│  - PUT /api/courses/:id/intro-video (update intro video)   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Page Structure

```
/dashboard/instructor/courses/[id]/edit
```

### Course Edit Page Component

```javascript
// frontend/app/(dashboard)/dashboard/instructor/courses/[id]/edit/page.js

export default function EditCoursePage({ params }) {
  const courseId = params.id;
  
  // State
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);
  
  // Fetch course data
  useEffect(() => {
    fetchCourseData(courseId);
  }, [courseId]);
  
  // Handlers
  const handleUpdateGeneralInfo = async (updatedData) => {};
  const handleAddChapter = async (chapterData) => {};
  const handleAddLesson = async (lessonData) => {};
  const handleAddQuiz = async (quizData) => {};
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="structure">Course Structure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <CourseDetailsForm 
            courseData={courseData}
            setCourseData={setCourseData}
            mode="edit"
            onSave={handleUpdateGeneralInfo}
          />
        </TabsContent>
        
        <TabsContent value="structure">
          <CourseStructureEditor
            courseData={courseData}
            setCourseData={setCourseData}
            mode="edit"
            onAddChapter={handleAddChapter}
            onAddLesson={handleAddLesson}
            onAddQuiz={handleAddQuiz}
          />
        </TabsContent>
        
        <TabsContent value="preview">
          <EnhancedCoursePreview courseData={courseData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### API Client Functions

```javascript
// frontend/lib/apiCalls/courses/getCourseForEdit.apiCall.js
export const getCourseForEdit = async (courseId) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

// frontend/lib/apiCalls/courses/updateCourseInfo.apiCall.js
export const updateCourseInfo = async (courseId, updateData) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updateData),
    }
  );
  return response.json();
};

// frontend/lib/apiCalls/courses/updateCourseThumbnail.apiCall.js
export const updateCourseThumbnail = async (courseId, thumbnailFile) => {
  const formData = new FormData();
  formData.append("thumbnail", thumbnailFile);
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/thumbnail`,
    {
      method: "PUT",
      credentials: "include",
      body: formData,
    }
  );
  return response.json();
};
```

## Data Models

### Course Data Model (Edit Mode)

```javascript
{
  id: string,
  title: string,
  subtitle: string,
  description: string,
  category: string,
  subcategory_id: string,
  level: string,
  price: number,
  thumbnail_url: string,
  intro_video_url: string,
  intro_video_hls_url: string,
  learning_objectives: string,
  requirements: string,
  target_audience: string,
  status: string, // 'draft', 'pending_review', 'approved', 'rejected'
  chapters: Array<Chapter>,
  instructor: {
    id: string,
    first_name: string,
    last_name: string
  }
}
```

### Chapter Data Model

```javascript
{
  id: string,
  title: string,
  description: string,
  order_number: number,
  lessons: Array<Lesson>,
  quizzes: Array<Quiz>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Course data fetching
*For any* valid course ID belonging to the instructor, the course data should be fetched and displayed in the edit form
**Validates: Requirements 1.3, 1.4**

### Property 2: Status-based editing restrictions
*For any* course with status "pending_review", general information editing should be disabled with an explanatory message
**Validates: Requirements 6.1, 6.2**

### Property 3: General information updates
*For any* valid update to general information fields, the changes should be saved to the backend and reflected in the UI
**Validates: Requirements 2.8, 2.9**

### Property 4: Chapter addition
*For any* valid new chapter data, the chapter should be created via API and added to the course structure
**Validates: Requirements 3.4, 3.5**

### Property 5: Lesson addition
*For any* valid new lesson data, the lesson should be created via API and added to the specified chapter
**Validates: Requirements 4.5, 4.6**

### Property 6: Quiz addition
*For any* valid new quiz data, the quiz should be created via API and added to the specified chapter
**Validates: Requirements 5.5, 5.6**

### Property 7: Component reusability
*For any* component used in create mode, it should work correctly in edit mode with pre-filled data
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 8: Preview accuracy
*For any* course data, the preview should display the same information and layout as the public course page
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 9: Validation consistency
*For any* field being edited, the validation rules should match those used in the create page
**Validates: Requirements 2.2, 2.3, 2.4, 3.3, 4.3, 5.3, 5.4**

### Property 10: Feedback clarity
*For any* save operation, appropriate loading, success, or error feedback should be displayed
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

## Error Handling

### Error Categories

1. **Fetch Errors**: Course data not found or unauthorized
2. **Update Errors**: Validation failures or server errors
3. **Status Errors**: Attempting to edit while pending review
4. **Network Errors**: Connection issues
5. **Permission Errors**: Not the course owner

### Error Handling Strategy

```javascript
// Fetch course data with error handling
const fetchCourseData = async (courseId) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await getCourseForEdit(courseId);
    
    if (!response.success) {
      throw new Error(response.message || "Failed to load course");
    }
    
    // Check if user is the instructor
    if (response.data.instructor.id !== currentUserId) {
      throw new Error("You are not authorized to edit this course");
    }
    
    setCourseData(response.data);
  } catch (error) {
    setError(error.message);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};

// Update general info with status check
const handleUpdateGeneralInfo = async (updatedData) => {
  if (courseData.status === "pending_review") {
    toast.error("Cannot edit course while it is pending review");
    return;
  }
  
  try {
    setSaving(true);
    
    const response = await updateCourseInfo(courseData.id, updatedData);
    
    if (!response.success) {
      throw new Error(response.message || "Failed to update course");
    }
    
    setCourseData(response.data);
    toast.success("Course updated successfully");
  } catch (error) {
    toast.error(error.message);
  } finally {
    setSaving(false);
  }
};
```

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Course data fetching and parsing
- Status-based restriction logic
- Component mode switching (create vs edit)
- API client functions
- Error handling for various scenarios

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using **fast-check**.

Each property test should:
- Generate random course data
- Test edit operations with various inputs
- Verify status restrictions
- Test component reusability
- Run a minimum of 100 iterations per property

Property tests will be tagged with comments:
```javascript
// Feature: course-edit-page, Property 2: Status-based editing restrictions
```

### Integration Testing

Integration tests will verify:
- Complete edit flow from My Courses to Edit Page
- Updating general information end-to-end
- Adding chapters/lessons/quizzes
- Preview display accuracy
- Navigation between tabs

## Implementation Details

### Component Mode Prop

```javascript
// CourseDetailsForm with mode prop
<CourseDetailsForm
  courseData={courseData}
  setCourseData={setCourseData}
  mode="edit" // or "create"
  onSave={handleSave} // Only in edit mode
/>

// Inside CourseDetailsForm
const isEditMode = mode === "edit";

// Show save button only in edit mode
{isEditMode && (
  <Button onClick={() => onSave(courseData)}>
    Save Changes
  </Button>
)}
```

### Status-Based Restrictions

```javascript
// Disable editing when pending review
const canEdit = courseData.status !== "pending_review";

<Input
  disabled={!canEdit}
  value={courseData.title}
  onChange={(e) => handleFieldChange("title", e.target.value)}
/>

{!canEdit && (
  <Alert>
    <AlertCircle className="w-4 h-4" />
    <AlertDescription>
      This course is currently under review and cannot be edited.
    </AlertDescription>
  </Alert>
)}
```

### Enhanced Course Preview

The preview should match the actual student view by:

1. Using the same layout as the public course page
2. Displaying real data (not placeholder text)
3. Showing intro video if available
4. Displaying learning objectives, requirements, target audience
5. Showing proper course structure with chapters and lessons

```javascript
// Enhanced preview with real data
<EnhancedCoursePreview courseData={courseData}>
  {/* Hero section with intro video */}
  {courseData.intro_video_url && (
    <video src={courseData.intro_video_url} controls />
  )}
  
  {/* Learning objectives */}
  {courseData.learning_objectives && (
    <section>
      <h2>What You'll Learn</h2>
      <p>{courseData.learning_objectives}</p>
    </section>
  )}
  
  {/* Requirements */}
  {courseData.requirements && (
    <section>
      <h2>Requirements</h2>
      <p>{courseData.requirements}</p>
    </section>
  )}
  
  {/* Target audience */}
  {courseData.target_audience && (
    <section>
      <h2>Who This Course Is For</h2>
      <p>{courseData.target_audience}</p>
    </section>
  )}
</EnhancedCoursePreview>
```

### My Courses Page Integration

```javascript
// Add Edit button to course cards
<div className="course-card">
  <h3>{course.title}</h3>
  <p>Status: {course.status}</p>
  <div className="actions">
    <Link href={`/dashboard/instructor/courses/${course.id}/edit`}>
      <Button>
        <Edit className="w-4 h-4 mr-2" />
        Edit Course
      </Button>
    </Link>
  </div>
</div>
```

## Security Considerations

1. **Authorization**: Verify instructor owns the course before allowing edits
2. **Status Validation**: Enforce pending_review restriction on backend
3. **Input Validation**: Validate all updates match backend rules
4. **File Upload**: Validate file types and sizes for thumbnails/videos
5. **XSS Prevention**: Sanitize user input in preview

## Performance Considerations

1. **Lazy Loading**: Load course data only when needed
2. **Optimistic Updates**: Update UI immediately, sync with server
3. **Debouncing**: Debounce auto-save operations
4. **Caching**: Cache course data to avoid refetching
5. **Image Optimization**: Optimize thumbnail uploads

## Accessibility

1. **Keyboard Navigation**: All tabs and buttons keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels for edit mode
3. **Focus Management**: Focus moves appropriately between tabs
4. **Error Announcements**: Use ARIA live regions for save feedback
5. **Status Indicators**: Clear visual and text indicators for course status
