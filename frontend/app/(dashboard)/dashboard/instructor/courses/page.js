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
import { deleteCourse } from "@/lib/apiCalls/courses/deleteCourse.apiCall";
import { toast } from "sonner";

export default function InstructorCoursesPage() {
  const { courses, loading, filters, updateFilters, refetch } = useInstructorCourses();

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
      // Refresh courses list after deletion
      if (refetch) {
        refetch();
      } else {
        // Fallback: reload the page if refetch is not available
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete course");
      throw error; // Re-throw to let the component handle the loading state
    }
  };

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
            <CourseListItem
              key={course.id}
              course={course}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

