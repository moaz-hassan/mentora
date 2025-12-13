

export const formatCourseResponse = (course, enrollmentsCount, reviewStats, options = {}) => {
  const { includeFullContent = false } = options;
  const filteredCourse = { ...course };

  let totalResources = 0;
  if (filteredCourse.Chapters) {
    filteredCourse.Chapters = filteredCourse.Chapters.map((chapter) => {
      if (chapter.Lessons) {
        chapter.Lessons = chapter.Lessons.map((lesson) => {
          if (lesson.materials) {
            totalResources += lesson.materials.length;
          }

          // For admin preview or preview lessons, include full content
          if (lesson.is_preview || includeFullContent) {
            return {
              id: lesson.id,
              title: lesson.title,
              lesson_type: lesson.lesson_type,
              video_url: lesson.video_url,
              video_public_id: lesson.video_public_id,
              hls_url: lesson.hls_url,
              content: lesson.content,
              duration: lesson.duration,
              order_number: lesson.order_number,
              is_preview: lesson.is_preview,
              LessonMaterials: lesson.materials,
            };
          }
          return {
            id: lesson.id,
            title: lesson.title,
            lesson_type: lesson.lesson_type,
            duration: lesson.duration,
            order_number: lesson.order_number,
            is_preview: lesson.is_preview,
            LessonMaterials: lesson.materials,
          };
        });
      }
      if (chapter.Quizzes) {
        chapter.Quizzes = chapter.Quizzes.map((quiz) => {
          // For admin preview, include full questions
          if (includeFullContent) {
            return {
              id: quiz.id,
              title: quiz.title,
              order_number: quiz.order_number,
              questions: quiz.questions,
              questions_length: quiz.questions?.length || 0,
            };
          }
          return {
            id: quiz.id,
            title: quiz.title,
            order_number: quiz.order_number,
            questions_length: quiz.questions?.length || 0,
          };
        });
      }
      return chapter;
    });
  }

  const averageRating = reviewStats.averageRating
    ? parseFloat(reviewStats.averageRating).toFixed(1)
    : null;
  const totalReviews = parseInt(reviewStats.totalReviews) || 0;

  filteredCourse.total_resources = totalResources;
  filteredCourse.enrollments_count = enrollmentsCount;
  filteredCourse.average_rating = averageRating
    ? parseFloat(averageRating)
    : null;
  filteredCourse.total_reviews = totalReviews;

  if (filteredCourse.Category) {
    filteredCourse.category_name = filteredCourse.Category.name;
    filteredCourse.category_id = filteredCourse.Category.id;
  }
  if (filteredCourse.SubCategory) {
    filteredCourse.subcategory_name = filteredCourse.SubCategory.name;
    filteredCourse.subcategory_id = filteredCourse.SubCategory.id;
  }

  return filteredCourse;
};

