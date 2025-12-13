"use client"
import { useState, useEffect, useRef } from "react";
import { Star, Users, PlayCircle } from "lucide-react";
import { getInstructorName, getInstructorInitials } from "@/lib/utils/courseUtils";
import getInstructorStats from "@/lib/apiCalls/instructor/getInstructorStats";

export default function InstructorSection({ course }) {
  const [instructorStats, setInstructorStats] = useState(null);
  const instructorName = getInstructorName(course.Instructor);
  const instructorInitials = getInstructorInitials(course.Instructor);

  const fetchedInstructorId = useRef(null);

  useEffect(() => {
    if (course.Instructor?.id && course.Instructor.id !== fetchedInstructorId.current) {
      fetchedInstructorId.current = course.Instructor.id;
      fetchInstructorStats(course.Instructor.id);
    }
  }, [course.Instructor?.id]);

  const fetchInstructorStats = async (instructorId) => {
    try {
      const response = await getInstructorStats(instructorId);
      if (response.success) {
        setInstructorStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching instructor stats:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Instructor</h2>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-border flex-shrink-0">
          {course.Instructor?.Profile?.avatar_url ? (
            <img
              src={course.Instructor.Profile.avatar_url}
              alt={instructorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-bold text-xl">
              {instructorInitials}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground hover:underline cursor-pointer">
            {instructorName}
          </h3>
          <p className="text-primary text-sm font-medium mb-3">
            {course.Instructor?.Profile?.headline}
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground mb-4">
            {instructorStats && (
              <>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-muted-foreground" />{" "}
                  {instructorStats.averageRating} Rating
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />{" "}
                  {instructorStats.totalStudents.toLocaleString()} Students
                </span>
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" />{" "}
                  {instructorStats.totalCourses} Courses
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {course.Instructor?.Profile?.bio || (
              <span className="text-muted-foreground">No bio yet</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
