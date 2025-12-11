"use client";

import { useState, useEffect, useCallback } from "react";
import CourseFilters, { filterEnrollments, getFilterCounts } from "../learning/CourseFilters";
import CourseGrid from "../learning/CourseGrid";
import getUserEnrollments from "@/lib/apiCalls/enrollments/enrollments.apiCall";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const emptyMessages = {
  all: "You haven't enrolled in any courses yet",
  "in-progress": "No courses in progress",
  completed: "No completed courses yet",
  archived: "No archived courses",
};

export default function MyLearningTab() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserEnrollments();
      if (response.success) {
        setEnrollments(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const filteredEnrollments = filterEnrollments(enrollments, activeFilter).filter(
    (enrollment) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        enrollment.Course?.title?.toLowerCase().includes(query) ||
        enrollment.Course?.Instructor?.first_name?.toLowerCase().includes(query) ||
        enrollment.Course?.Instructor?.last_name?.toLowerCase().includes(query)
      );
    }
  );
  const counts = getFilterCounts(enrollments);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-2 px-1">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <CourseFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
        
        {}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/50"
          />
        </div>
      </div>

      {}
      <CourseGrid
        enrollments={filteredEnrollments}
        emptyMessage={searchQuery ? "No courses match your search" : emptyMessages[activeFilter]}
      />
    </div>
  );
}
