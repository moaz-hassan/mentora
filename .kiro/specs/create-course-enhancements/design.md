# Design Document

## Overview

This design document outlines enhancements to the course creation page including dynamic category/subcategory fetching, comprehensive frontend validation, new course fields, chapter requirement validation, and improved success messaging. The implementation will improve data integrity, user experience, and ensure frontend validation matches backend rules.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Course Creation Page Component                  │
│  - Form state management                                     │
│  - Validation logic                                          │
│  - API integration                                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Child Components                            │
│  - CourseDetailsForm (enhanced)                             │
│  - CourseStructureEditor (validation added)                 │
│  - UploadProgressModal (enhanced messaging)                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Client Layer                           │
│  - fetchCategories()                                         │
│  - fetchSubCategories()                                      │
│  - uploadCourseContent() (enhanced)                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│  - GET /api/categories                                       │
│  - GET /api/subcategories                                    │
│  - POST /api/courses (with new fields)                      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Enhanced Course Data Model

```javascript
{
  // Existing fields
  title: string,
  description: string,
  category_id: string,        // Changed: now stores category ID instead of name
  level: string,
  price: number,
  thumbnail: string,
  thumbnailFile: File,
  introVideoUrl: string,
  introVideoFile: File,
  chapters: Array,
  
  // New fields
  subtitle: string,
  subcategory_id: string,
  learning_objectives: string,
  requirements: string,
  target_audience: string
}
```

### Validation Rules Object

```javascript
const validationRules = {
  course: {
    title: { min: 1, max: 255, required: true },
    subtitle: { min: 0, max: 500, required: false },
    description: { min: 1, max: 5000, required: true },
    category_id: { required: false },  // Changed: now validates category ID
    subcategory_id: { required: false },
    level: { enum: ['beginner', 'intermediate', 'advanced'], required: false },
    price: { min: 0, required: false },
    learning_objectives: { min: 0, max: 2000, required: false },
    requirements: { min: 0, max: 2000, required: false },
    target_audience: { min: 0, max: 2000, required: false }
  },
  chapter: {
    title: { min: 1, max: 255, required: true },
    description: { min: 0, max: 1000, required: false }
  },
  lesson: {
    title: { min: 1, max: 255, required: true },
    lesson_type: { enum: ['video', 'text'], required: false },
    duration: { min: 0, required: false }
  },
  quiz: {
    title: { min: 3, max: 255, required: true },
    questions: {
      question: { min: 3, max: 255, required: true },
      options: { required: true, isArray: true },
      answer: { min: 1, max: 1, required: true }
    }
  }
}
```

### API Client Functions

```javascript
// frontend/lib/apiCalls/categories/getCategories.apiCall.js
export const getCategories = async () => {
  const response = await fetch(`${API_URL}/api/categories`);
  return response.json();
}

// frontend/lib/apiCalls/categories/getSubCategories.apiCall.js
export const getSubCategories = async (categoryId = null) => {
  const url = categoryId 
    ? `${API_URL}/api/categories/${categoryId}/subcategories`
    : `${API_URL}/api/subcategories`;
  const response = await fetch(url);
  return response.json();
}
```

### Validation Helper Functions

```javascript
// frontend/lib/validation/courseValidation.js

export const validateField = (fieldName, value, rules) => {
  const rule = rules[fieldName];
  if (!rule) return null;
  
  // Required check
  if (rule.required && (!value || value.trim() === '')) {
    return `${fieldName} is required`;
  }
  
  // Length checks
  if (value && rule.min && value.length < rule.min) {
    return `${fieldName} must be at least ${rule.min} characters`;
  }
  if (value && rule.max && value.length > rule.max) {
    return `${fieldName} must not exceed ${rule.max} characters`;
  }
  
  // Enum check
  if (value && rule.enum && !rule.enum.includes(value)) {
    return `${fieldName} must be one of: ${rule.enum.join(', ')}`;
  }
  
  return null;
}

export const validateCourse = (courseData) => {
  const errors = {};
  
  Object.keys(validationRules.course).forEach(field => {
    const error = validateField(field, courseData[field], validationRules.course);
    if (error) errors[field] = error;
  });
  
  return errors;
}

export const validateChapter = (chapter) => {
  const errors = {};
  
  Object.keys(validationRules.chapter).forEach(field => {
    const error = validateField(field, chapter[field], validationRules.chapter);
    if (error) errors[field] = error;
  });
  
  return errors;
}

export const validateLesson = (lesson) => {
  const errors = {};
  
  Object.keys(validationRules.lesson).forEach(field => {
    const error = validateField(field, lesson[field], validationRules.lesson);
    if (error) errors[field] = error;
  });
  
  return errors;
}

export const validateQuiz = (quiz) => {
  const errors = {};
  
  // Validate quiz title
  const titleError = validateField('title', quiz.title, validationRules.quiz);
  if (titleError) errors.title = titleError;
  
  // Validate questions
  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    errors.questions = 'Questions must be an array';
  } else {
    quiz.questions.forEach((q, index) => {
      const questionErrors = {};
      
      if (!q.question || q.question.length < 3 || q.question.length > 255) {
        questionErrors.question = 'Question must be between 3 and 255 characters';
      }
      
      if (!q.options || !Array.isArray(q.options)) {
        questionErrors.options = 'Options must be an array';
      }
      
      if (!q.answer || q.answer.length !== 1) {
        questionErrors.answer = 'Answer must be a single character';
      }
      
      if (Object.keys(questionErrors).length > 0) {
        errors[`question_${index}`] = questionErrors;
      }
    });
  }
  
  return errors;
}

export const validateChapterRequirement = (chapters) => {
  if (!chapters || chapters.length === 0) {
    return 'At least one chapter is required before saving or submitting';
  }
  return null;
}
```

## Data Models

### Category Model (Frontend)

```javascript
{
  id: string,
  name: string,
  createdAt: string,
  updatedAt: string
}
```

### SubCategory Model (Frontend)

```javascript
{
  id: string,
  category_id: string,
  name: string,
  createdAt: string,
  updatedAt: string
}
```

### Enhanced Upload Progress Model

```javascript
{
  status: 'uploading' | 'success' | 'error',
  message: string,
  details: {
    courseTitle: string,
    chaptersCount: number,
    lessonsCount: number,
    quizzesCount: number,
    status: 'Draft' | 'Pending Review'
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Category fetching on load
*For any* page load, the categories and subcategories should be fetched from the API and populated in the dropdowns
**Validates: Requirements 1.1, 1.2**

### Property 2: Subcategory filtering by category
*For any* selected category, only subcategories belonging to that category should be displayed in the subcategory dropdown
**Validates: Requirements 1.3, 6.2, 6.5**

### Property 3: Frontend validation matches backend
*For any* field with backend validation rules, the frontend validation should enforce the same constraints
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

### Property 4: Chapter requirement enforcement
*For any* save or submit action, if no chapters exist, the action should be prevented and an error message displayed
**Validates: Requirements 4.1, 4.2, 4.4**

### Property 5: New fields included in submission
*For any* course submission, the subtitle, learning_objectives, requirements, target_audience, and subcategory_id fields should be included in the API request
**Validates: Requirements 2.5, 6.4**

### Property 6: Validation error display
*For any* validation error, the error message should be displayed next to the corresponding field
**Validates: Requirements 3.9, 7.1, 7.2, 7.4**

### Property 7: Success message details
*For any* successful upload, the success message should include course title, chapter count, lesson count, quiz count, and status
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

### Property 8: Subcategory dropdown state
*For any* state where no category is selected, the subcategory dropdown should be disabled
**Validates: Requirements 6.3**

### Property 9: Real-time validation feedback
*For any* field that is corrected after showing an error, the error message should be immediately removed
**Validates: Requirements 7.3**

### Property 10: Button state management
*For any* state where validation errors exist or chapter requirement is not met, the save and submit buttons should be disabled
**Validates: Requirements 3.10, 4.3, 4.5**

## Error Handling

### Error Categories

1. **API Fetch Errors**: Category/subcategory fetching failures
2. **Validation Errors**: Field-level validation failures
3. **Submission Errors**: Course upload failures
4. **Network Errors**: Connection issues

### Error Handling Strategy

```javascript
// Category fetching with retry
const [categories, setCategories] = useState([]);
const [categoriesLoading, setCategories Loading] = useState(true);
const [categoriesError, setCategoriesError] = useState(null);

const fetchCategories = async () => {
  try {
    setCategoriesLoading(true);
    setCategoriesError(null);
    const data = await getCategories();
    setCategories(data.data);
  } catch (error) {
    setCategoriesError(error.message);
    toast.error('Failed to load categories. Please try again.');
  } finally {
    setCategoriesLoading(false);
  }
};

// Validation error display
const [validationErrors, setValidationErrors] = useState({});

const handleFieldChange = (field, value) => {
  // Update value
  setCourseData({ ...courseData, [field]: value });
  
  // Clear error for this field
  if (validationErrors[field]) {
    setValidationErrors({ ...validationErrors, [field]: null });
  }
};

const handleSubmit = () => {
  // Validate all fields
  const errors = validateCourse(courseData);
  
  // Check chapter requirement
  const chapterError = validateChapterRequirement(courseData.chapters);
  if (chapterError) {
    errors.chapters = chapterError;
  }
  
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  
  // Proceed with submission
  handleUpload();
};
```

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Validation functions correctly enforce rules
- Category filtering logic works correctly
- Error message generation is accurate
- Button state logic is correct

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using **fast-check**.

Each property test should:
- Generate random valid and invalid course data
- Test validation rules with edge cases
- Verify error handling for various scenarios
- Run a minimum of 100 iterations per property

Property tests will be tagged with comments:
```javascript
// Feature: create-course-enhancements, Property 3: Frontend validation matches backend
```

### Integration Testing

Integration tests will verify:
- Complete course creation flow with new fields
- Category/subcategory selection and filtering
- Validation error display and clearing
- Success message display with correct details

## Implementation Details

### New Form Fields Layout

```jsx
<CourseDetailsForm>
  {/* Existing fields */}
  <Input name="title" />
  <Textarea name="description" />
  
  {/* New field: Subtitle */}
  <Input 
    name="subtitle" 
    placeholder="A brief subtitle for your course"
    maxLength={500}
  />
  
  {/* Enhanced: Dynamic categories - stores category ID */}
  <Select 
    name="category_id"
    value={courseData.category_id}
    onValueChange={(value) => {
      setCourseData({ 
        ...courseData, 
        category_id: value,  // Store category ID
        subcategory_id: ''   // Clear subcategory when category changes
      });
    }}
  >
    {categories.map(cat => (
      <SelectItem key={cat.id} value={cat.id}>
        {cat.name}
      </SelectItem>
    ))}
  </Select>
  
  {/* New field: Subcategory - stores subcategory ID */}
  <Select 
    name="subcategory_id" 
    disabled={!courseData.category_id}
    value={courseData.subcategory_id}
    onValueChange={(value) => {
      setCourseData({ 
        ...courseData, 
        subcategory_id: value  // Store subcategory ID
      });
    }}
  >
    {filteredSubcategories.map(sub => (
      <SelectItem key={sub.id} value={sub.id}>
        {sub.name}
      </SelectItem>
    ))}
  </Select>
  
  {/* Existing fields */}
  <Select name="level" />
  <Input name="price" />
  
  {/* New field: Learning Objectives */}
  <Textarea 
    name="learning_objectives"
    placeholder="What will students learn? (e.g., Build responsive websites, Master React hooks, Deploy to production)"
    rows={4}
    maxLength={2000}
  />
  
  {/* New field: Requirements */}
  <Textarea 
    name="requirements"
    placeholder="What do students need before taking this course? (e.g., Basic HTML/CSS knowledge, A computer with internet)"
    rows={3}
    maxLength={2000}
  />
  
  {/* New field: Target Audience */}
  <Textarea 
    name="target_audience"
    placeholder="Who is this course for? (e.g., Beginners wanting to learn web development, Developers looking to master React)"
    rows={3}
    maxLength={2000}
  />
  
  {/* Existing fields */}
  <ThumbnailUpload />
  <IntroVideoUpload />
</CourseDetailsForm>
```

### Enhanced Success Message

```jsx
<UploadProgressModal>
  {progress.status === 'success' && (
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        Course Uploaded Successfully!
      </h3>
      <div className="bg-gray-50 rounded-lg p-4 mt-4 text-left">
        <p className="font-medium mb-2">{progress.details.courseTitle}</p>
        <div className="space-y-1 text-sm text-gray-600">
          <p>📚 {progress.details.chaptersCount} chapters</p>
          <p>📝 {progress.details.lessonsCount} lessons</p>
          <p>❓ {progress.details.quizzesCount} quizzes</p>
          <p className="mt-2 font-medium">
            Status: <span className="text-blue-600">{progress.details.status}</span>
          </p>
        </div>
      </div>
    </div>
  )}
</UploadProgressModal>
```

### Chapter Requirement Validation

```jsx
const canSaveOrSubmit = () => {
  const hasTitle = courseData?.title && courseData.title.trim() !== '';
  const hasDescription = courseData?.description && courseData.description.trim() !== '';
  const hasChapters = courseData?.chapters && courseData.chapters.length > 0;
  
  return hasTitle && hasDescription && hasChapters;
};

<Button
  onClick={handleSaveDraft}
  disabled={!canSaveOrSubmit()}
  title={!hasChapters ? 'At least one chapter is required' : ''}
>
  Save as Draft
</Button>
```

## Security Considerations

1. **Input Sanitization**: Sanitize all text inputs before submission
2. **File Validation**: Validate file types and sizes for thumbnails and videos
3. **XSS Prevention**: Escape user-generated content in previews
4. **API Authentication**: Ensure all API calls include authentication tokens

## Performance Considerations

1. **Debouncing**: Debounce validation on text inputs (300ms)
2. **Lazy Loading**: Load subcategories only when category is selected
3. **Memoization**: Memoize validation functions to avoid recalculation
4. **Optimistic Updates**: Update UI immediately, sync with server asynchronously

## Accessibility

1. **Labels**: All form fields have associated labels
2. **Error Announcements**: Use ARIA live regions for validation errors
3. **Keyboard Navigation**: All interactive elements are keyboard accessible
4. **Focus Management**: Focus moves to first error on validation failure
5. **Screen Reader Support**: Provide descriptive text for all form elements
