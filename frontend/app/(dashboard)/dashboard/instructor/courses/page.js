"use client";

import {
  CoursesPageHeader,
  CoursesStatsGrid,
  CoursesFilterBar,
  CourseListItem,
  EmptyCoursesState,
} from "@/components/instructor/courses";
import { useInstructorCourses } from "@/hooks/course";
import InstructorCoursesSkeleton from "@/components/skeleton/InstructorCoursesSkeleton";

export default function InstructorCoursesPage() {
  const { courses, loading, filters, updateFilters } = useInstructorCourses();

  if (loading) {
    return <InstructorCoursesSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <CoursesPageHeader />

      <CoursesStatsGrid courses={courses} />

      <CoursesFilterBar
        searchQuery={filters.search}
        statusFilter={filters.status}
        onSearchChange={(search) => updateFilters({ search })}
        onStatusChange={(status) => updateFilters({ status })}
      />

      {courses.length === 0 ? (
        <EmptyCoursesState
          searchQuery={filters.search}
          statusFilter={filters.status}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <CourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
