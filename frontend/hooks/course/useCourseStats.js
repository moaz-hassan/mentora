import { useMemo } from "react";


export function useCourseStats(courseData) {
  const stats = useMemo(() => {
    const chapters = courseData?.chapters || [];
    let lessonsCount = 0;
    let quizzesCount = 0;

    chapters.forEach((chapter) => {
      if (chapter.items) {
        chapter.items.forEach((item) => {
          if (item.type === "lesson") lessonsCount++;
          if (item.type === "quiz") quizzesCount++;
        });
      }
    });

    return {
      chaptersCount: chapters.length,
      lessonsCount,
      quizzesCount,
      totalItems: lessonsCount + quizzesCount,
    };
  }, [courseData]);

  return stats;
}
