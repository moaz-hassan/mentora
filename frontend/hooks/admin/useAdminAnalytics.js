import { useState, useEffect, useCallback } from "react";
import { subDays } from "date-fns";
import { toast } from "sonner";
import {
  getPlatformOverview,
  getAdminRevenueAnalytics,
  getUserGrowthAnalytics,
  getEnrollmentAnalytics,
  getCoursePerformanceAnalytics,
  exportAnalyticsData,
} from "@/lib/apiCalls/admin/analytics.apiCall";

/**
 * Custom hook for admin analytics data
 * @returns {Object} Analytics data, loading states, and handler functions
 */
export function useAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [enrollmentsData, setEnrollmentsData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  const generateAIInsights = useCallback((data) => {
    const insights = [];

    if (data?.revenueChange > 10) {
      insights.push({
        type: "trend_up",
        title: "Revenue Growth",
        description: `Revenue increased by ${data.revenueChange.toFixed(
          1
        )}% compared to the previous period. Consider expanding marketing efforts.`,
        priority: "medium",
      });
    } else if (data?.revenueChange < -10) {
      insights.push({
        type: "trend_down",
        title: "Revenue Decline",
        description: `Revenue decreased by ${Math.abs(
          data.revenueChange
        ).toFixed(
          1
        )}%. Review pricing strategy and course offerings.`,
        priority: "high",
      });
    }

    if (data?.userGrowth > 15) {
      insights.push({
        type: "trend_up",
        title: "Strong User Growth",
        description: `User base grew by ${data.userGrowth.toFixed(
          1
        )}%. Great momentum - focus on retention strategies.`,
        priority: "low",
      });
    }

    if (data?.enrollmentRate < 5) {
      insights.push({
        type: "warning",
        title: "Low Enrollment Rate",
        description:
          "Enrollment rate is below average. Consider promotional campaigns or course discounts.",
        priority: "high",
        action: "View Marketing Tools",
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "suggestion",
        title: "Platform Performance",
        description:
          "Platform metrics are stable. Continue monitoring for trends and opportunities.",
        priority: "low",
      });
    }

    setAiInsights(insights);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const params = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      const [overviewRes, revenueRes, usersRes, enrollmentsRes, coursesRes] =
        await Promise.all([
          getPlatformOverview(params),
          getAdminRevenueAnalytics(params),
          getUserGrowthAnalytics(params),
          getEnrollmentAnalytics(params),
          getCoursePerformanceAnalytics(),
        ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
        generateAIInsights(overviewRes.data);
      }
      if (revenueRes.success) setRevenueData(revenueRes.data?.trend || []);
      if (usersRes.success) setUsersData(usersRes.data?.trend || []);
      if (enrollmentsRes.success)
        setEnrollmentsData(enrollmentsRes.data?.trend || []);
      if (coursesRes.success) setCoursesData(coursesRes.data?.courses || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error.message);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, generateAIInsights]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("Analytics refreshed");
  }, [fetchData]);

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
  }, []);

  const handleExport = useCallback(
    async (format) => {
      try {
        await exportAnalyticsData({
          format,
          startDate: dateRange.from?.toISOString(),
          endDate: dateRange.to?.toISOString(),
        });
        toast.success(`Export started - ${format.toUpperCase()}`);
      } catch (error) {
        toast.error("Export failed");
      }
    },
    [dateRange]
  );

  return {
    loading,
    refreshing,
    error,
    dateRange,
    overview,
    revenueData,
    usersData,
    enrollmentsData,
    coursesData,
    aiInsights,
    handleRefresh,
    handleDateRangeChange,
    handleExport,
    refetch: fetchData,
  };
}
