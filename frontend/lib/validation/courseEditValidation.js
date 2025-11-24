/**
 * Course Edit Validation
 * Consolidated validation for all course edit sections
 */

// ============================================
// COURSE INFO VALIDATION
// ============================================

export const courseInfoRules = {
  title: { min: 1, max: 255, required: true },
  subtitle: { min: 1, max: 500, required: true },
  description: { min: 1, max: 5000, required: true },
  category: { required: true },
  subcategory_id: { required: true },
  level: {
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  learning_objectives: { min: 1, max: 2000, required: true },
  requirements: { min: 1, max: 2000, required: true },
  target_audience: { min: 1, max: 2000, required: true },
};

export const validateCourseInfo = (courseData) => {
  const errors = {};
  Object.keys(courseInfoRules).forEach((field) => {
    const error = validateField(field, courseData?.[field], courseInfoRules);
    if (error) errors[field] = error;
  });
  return errors;
};

// ============================================
// COURSE PRICING VALIDATION
// ============================================

export const coursePricingRules = {
  price: { min: 0, required: true },
  have_discount: { required: false },
  discount_type: {
    enum: ["percentage", "fixed"],
    required: false,
  },
  discount_value: { min: 1, required: false },
  discount_start_date: { required: false },
  discount_end_date: { required: false },
};

export const validateCoursePricing = (pricingData) => {
  const errors = {};

  Object.keys(coursePricingRules).forEach((field) => {
    const error = validateField(field, pricingData?.[field], coursePricingRules);
    if (error) errors[field] = error;
  });

  // Custom validation: discount end date must be after start date
  if (pricingData?.discount_start_date && pricingData?.discount_end_date) {
    const startDate = new Date(pricingData.discount_start_date);
    const endDate = new Date(pricingData.discount_end_date);
    
    if (endDate <= startDate) {
      errors.discount_end_date = "Discount end date must be after start date";
    }
  }

  // Custom validation: if have_discount is true, discount fields are required
  if (pricingData?.have_discount) {
    if (!pricingData.discount_type) {
      errors.discount_type = "Discount type is required when discount is enabled";
    }
    if (!pricingData.discount_value || pricingData.discount_value <= 0) {
      errors.discount_value = "Discount value is required and must be greater than 0";
    }
    if (!pricingData.discount_start_date) {
      errors.discount_start_date = "Discount start date is required when discount is enabled";
    }
    if (!pricingData.discount_end_date) {
      errors.discount_end_date = "Discount end date is required when discount is enabled";
    }
  }

  // Custom validation: percentage discount cannot exceed 100
  if (pricingData?.discount_type === "percentage" && pricingData?.discount_value > 100) {
    errors.discount_value = "Percentage discount cannot exceed 100%";
  }

  return errors;
};

// ============================================
// CHAPTER VALIDATION
// ============================================

export const chapterRules = {
  title: { min: 1, max: 255, required: true },
  description: { min: 0, max: 1000, required: false },
};

export const validateChapter = (chapter) => {
  const errors = {};
  Object.keys(chapterRules).forEach((field) => {
    const error = validateField(field, chapter?.[field], chapterRules);
    if (error) errors[field] = error;
  });
  return errors;
};

export const validateChapterRequirement = (chapters) => {
  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return "At least one chapter is required before saving or submitting";
  }
  return null;
};

// ============================================
// LESSON VALIDATION
// ============================================

export const lessonRules = {
  title: { min: 1, max: 255, required: true },
  lesson_type: { enum: ["video", "text"], required: false },
  duration: { min: 0, required: false },
  content: { required: false },
  video_url: { required: false },
};

export const validateLesson = (lesson) => {
  const errors = {};

  Object.keys(lessonRules).forEach((field) => {
    const error = validateField(field, lesson?.[field], lessonRules);
    if (error) errors[field] = error;
  });

  // Custom validation: video lessons must have video_url
  if (lesson?.lesson_type === "video" && !lesson?.video_url) {
    errors.video_url = "Video URL is required for video lessons";
  }

  // Custom validation: text lessons must have content
  if (lesson?.lesson_type === "text" && !lesson?.content) {
    errors.content = "Content is required for text lessons";
  }

  return errors;
};

// ============================================
// QUIZ VALIDATION
// ============================================

export const quizRules = {
  title: { min: 3, max: 255, required: true },
  questions: {
    question: { min: 3, max: 255, required: true },
    options: { required: true, isArray: true },
    answer: { min: 1, max: 1, required: true },
  },
};

export const validateQuiz = (quiz) => {
  const errors = {};

  // Validate quiz title
  if (!quiz?.title || quiz.title.trim() === "") {
    errors.title = "Quiz title is required";
  } else if (quiz.title.length < 3 || quiz.title.length > 255) {
    errors.title = "Quiz title must be between 3 and 255 characters";
  }

  // Validate questions
  if (!quiz?.questions || !Array.isArray(quiz.questions)) {
    errors.questions = "Questions must be an array";
  } else if (quiz.questions.length === 0) {
    errors.questions = "At least one question is required";
  } else {
    quiz.questions.forEach((q, index) => {
      const questionErrors = {};

      // Validate question text
      if (!q.question || q.question.trim() === "") {
        questionErrors.question = "Question is required";
      } else if (q.question.length < 3 || q.question.length > 255) {
        questionErrors.question = "Question must be between 3 and 255 characters";
      }

      // Validate options
      if (!q.options || !Array.isArray(q.options)) {
        questionErrors.options = "Options must be an array";
      } else if (q.options.length === 0) {
        questionErrors.options = "At least one option is required";
      } else if (q.options.length < 2) {
        questionErrors.options = "At least two options are required";
      } else {
        const hasEmptyOption = q.options.some(opt => !opt || opt.trim() === "");
        if (hasEmptyOption) {
          questionErrors.options = "All options must have text";
        }
      }

      // Validate answer
      if (!q.answer || q.answer.trim() === "") {
        questionErrors.answer = "Answer is required";
      } else if (q.answer.length !== 1) {
        questionErrors.answer = "Answer must be a single character (A, B, C, or D)";
      } else if (!/^[A-D]$/i.test(q.answer)) {
        questionErrors.answer = "Answer must be A, B, C, or D";
      }

      // Validate that answer corresponds to an existing option
      if (q.answer && q.options && Array.isArray(q.options)) {
        const answerIndex = q.answer.toUpperCase().charCodeAt(0) - 65;
        if (answerIndex >= q.options.length) {
          questionErrors.answer = `Answer ${q.answer.toUpperCase()} does not correspond to any option`;
        }
      }

      if (Object.keys(questionErrors).length > 0) {
        errors[`question_${index}`] = questionErrors;
      }
    });
  }

  return errors;
};

export const validateQuestion = (question, index = 0) => {
  const errors = {};

  if (!question?.question || question.question.trim() === "") {
    errors.question = "Question is required";
  } else if (question.question.length < 3 || question.question.length > 255) {
    errors.question = "Question must be between 3 and 255 characters";
  }

  if (!question?.options || !Array.isArray(question.options)) {
    errors.options = "Options must be an array";
  } else if (question.options.length < 2) {
    errors.options = "At least two options are required";
  } else {
    const hasEmptyOption = question.options.some(opt => !opt || opt.trim() === "");
    if (hasEmptyOption) {
      errors.options = "All options must have text";
    }
  }

  if (!question?.answer || question.answer.trim() === "") {
    errors.answer = "Answer is required";
  } else if (!/^[A-D]$/i.test(question.answer)) {
    errors.answer = "Answer must be A, B, C, or D";
  }

  if (question?.answer && question?.options && Array.isArray(question.options)) {
    const answerIndex = question.answer.toUpperCase().charCodeAt(0) - 65;
    if (answerIndex >= question.options.length) {
      errors.answer = `Answer ${question.answer.toUpperCase()} does not correspond to any option`;
    }
  }

  return errors;
};

// ============================================
// SHARED VALIDATION HELPER
// ============================================

export const validateField = (fieldName, value, rules) => {
  const rule = rules[fieldName];
  if (!rule) return null;

  // Required check
  if (rule.required && (!value || (typeof value === "string" && value.trim() === ""))) {
    const displayName = fieldName.replace(/_/g, " ");
    return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return null;
  }

  // Length checks for strings
  if (typeof value === "string") {
    if (rule.min !== undefined && value.length < rule.min) {
      const displayName = fieldName.replace(/_/g, " ");
      return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} must be at least ${rule.min} character${rule.min !== 1 ? "s" : ""}`;
    }
    if (rule.max !== undefined && value.length > rule.max) {
      const displayName = fieldName.replace(/_/g, " ");
      return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} must not exceed ${rule.max} characters`;
    }
  }

  // Number checks
  if (typeof value === "number" || !isNaN(value)) {
    const numValue = typeof value === "number" ? value : parseFloat(value);
    if (rule.min !== undefined && numValue < rule.min) {
      const displayName = fieldName.replace(/_/g, " ");
      return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} must be at least ${rule.min}`;
    }
  }

  // Enum check
  if (rule.enum && !rule.enum.includes(value)) {
    const displayName = fieldName.replace(/_/g, " ");
    return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} must be one of: ${rule.enum.join(", ")}`;
  }

  return null;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const hasErrors = (errors) => {
  return Object.keys(errors).some((key) => errors[key] !== null && errors[key] !== undefined);
};
