import { useState, useEffect, useCallback } from "react";
import { getAllInstructorCourses } from "@/lib/apiCalls/instructor/getAllInstructorCourses.apiCall";
import { toast } from "react-toastify";

/**
 * Custom hook for managing instructor courses list
 * @returns {Object} Courses data, loading state, and filter functions
 */
export function useInstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllInstructorCourses();

      if (response.success) {
        setCourses(response.data || []);
        setFilteredCourses(response.data || []);
      } else {
        toast.error(response.message || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Apply filters
  useEffect(() => {
    let result = [...courses];

    // Filter by status
    if (filters.status !== "all") {
      result = result.filter((course) => course.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCourses(result);
  }, [courses, filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    courses: filteredCourses,
    allCourses: courses,
    loading,
    filters,
    updateFilters,
    refetch: fetchCourses,
  };
}
