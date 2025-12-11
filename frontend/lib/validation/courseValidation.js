
export const validationRules = {
  course: {
    title: { min: 1, max: 255, required: true },
    subtitle: { min: 1, max: 500, required: true },
    description: { min: 1, max: 5000, required: true },
    category: { required: true },
    subcategory_id: { required: true },
    level: {
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    price: { min: 0, required: true },
    learning_objectives: { min: 1, max: 2000, required: true },
    requirements: { min: 1, max: 2000, required: true },
    target_audience: { min: 1, max: 2000, required: true },
  },
  chapter: {
    title: { min: 1, max: 255, required: true },
    description: { min: 0, max: 1000, required: false },
  },
  lesson: {
    title: { min: 1, max: 255, required: true },
    lesson_type: { enum: ["video", "text"], required: false },
    duration: { min: 0, required: false },
  },
  quiz: {
    title: { min: 3, max: 255, required: true },
    questions: {
      question: { min: 3, max: 255, required: true },
      options: { required: true, isArray: true },
      answer: { min: 1, max: 1, required: true },
    },
  },
};


export const validateField = (fieldName, value, rules) => {
  const rule = rules[fieldName];
  if (!rule) return null;

  
  if (rule.required && (!value || (typeof value === "string" && value.trim() === ""))) {
    const displayName = fieldName.replace(/_/g, " ");
    return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} is required`;
  }

  
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return null;
  }

  
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

  
  if (typeof value === "number" || !isNaN(value)) {
    const numValue = typeof value === "number" ? value : parseFloat(value);
    if (rule.min !== undefined && numValue < rule.min) {
      const displayName = fieldName.replace(/_/g, " ");
      return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} must be at least ${rule.min}`;
    }
  }

  
  if (rule.enum && !rule.enum.includes(value)) {
    const displayName = fieldName.replace(/_/g, " ");
    return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} must be one of: ${rule.enum.join(", ")}`;
  }

  return null;
};


export const validateCourse = (courseData) => {
  const errors = {};

  Object.keys(validationRules.course).forEach((field) => {
    const error = validateField(field, courseData?.[field], validationRules.course);
    if (error) errors[field] = error;
  });

  return errors;
};


export const validateChapter = (chapter) => {
  const errors = {};

  Object.keys(validationRules.chapter).forEach((field) => {
    const error = validateField(field, chapter?.[field], validationRules.chapter);
    if (error) errors[field] = error;
  });

  return errors;
};


export const validateLesson = (lesson) => {
  const errors = {};

  Object.keys(validationRules.lesson).forEach((field) => {
    const error = validateField(field, lesson?.[field], validationRules.lesson);
    if (error) errors[field] = error;
  });

  return errors;
};


export const validateQuiz = (quiz) => {
  const errors = {};

  
  const titleError = validateField("title", quiz?.title, validationRules.quiz);
  if (titleError) errors.title = titleError;

  
  if (!quiz?.questions || !Array.isArray(quiz.questions)) {
    errors.questions = "Questions must be an array";
  } else if (quiz.questions.length === 0) {
    errors.questions = "At least one question is required";
  } else {
    quiz.questions.forEach((q, index) => {
      const questionErrors = {};

      
      if (!q.question || q.question.trim() === "") {
        questionErrors.question = "Question is required";
      } else if (q.question.length < 3 || q.question.length > 255) {
        questionErrors.question = "Question must be between 3 and 255 characters";
      }

      
      if (!q.options || !Array.isArray(q.options)) {
        questionErrors.options = "Options must be an array";
      } else if (q.options.length === 0) {
        questionErrors.options = "At least one option is required";
      }

      
      if (!q.answer || q.answer.trim() === "") {
        questionErrors.answer = "Answer is required";
      } else if (q.answer.length !== 1) {
        questionErrors.answer = "Answer must be a single character";
      }

      if (Object.keys(questionErrors).length > 0) {
        errors[`question_${index}`] = questionErrors;
      }
    });
  }

  return errors;
};


export const validateChapterRequirement = (chapters) => {
  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return "At least one chapter is required before saving or submitting";
  }
  return null;
};


export const hasErrors = (errors) => {
  return Object.keys(errors).some((key) => errors[key] !== null && errors[key] !== undefined);
};
