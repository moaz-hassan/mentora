import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getInstructorAnalytics } from "@/lib/apiCalls/instructor/getAnalytics.apiCall";
import { getEnrollmentTrend } from "@/lib/apiCalls/analytics/getEnrollmentTrend.apiCall";
import { toast } from "sonner";


export function useAnalytics() {
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");

  const [analytics, setAnalytics] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30");
  const [selectedCourse, setSelectedCourse] = useState(courseIdParam || "all");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courseId = selectedCourse === "all" ? null : selectedCourse;
      const analyticsResponse = await getInstructorAnalytics(courseId, parseInt(timeRange));
      const analyticsData = analyticsResponse.data;

      const enrollmentResponse = await getEnrollmentTrend(
        parseInt(timeRange),
        parseInt(timeRange) > 90 ? 'month' : parseInt(timeRange) > 30 ? 'week' : 'day'
      );
      const enrollmentTrendData = enrollmentResponse.data;

      setAnalytics(analyticsData);
      setEnrollmentData(enrollmentTrendData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data. Please try again.");
      toast.error("Failed to load analytics");
      setLoading(false);
    }
  }, [timeRange, selectedCourse]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    enrollmentData,
    loading,
    error,
    timeRange,
    selectedCourse,
    setTimeRange,
    setSelectedCourse,
    refetch: fetchAnalytics,
  };
}
