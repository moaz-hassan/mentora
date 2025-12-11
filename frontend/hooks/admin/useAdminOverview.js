import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import getAdminStats from "@/lib/apiCalls/admin/getAdminStats.apiCall";

/**
 * Custom hook for admin dashboard overview data
 * @returns {Object} Dashboard stats, recent activity, loading state, error, and refetch function
 */
export function useAdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    activeStudents: 0,
    newEnrollments: 0,
    openReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAdminStats();

      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.error || "Failed to load dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentActivity,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
