import { useState, useEffect, useCallback } from "react";
import { getInstructorAnalytics } from "@/lib/apiCalls/instructor/getAnalytics.apiCall";
import { getAllInstructorCourses } from "@/lib/apiCalls/instructor/getAllInstructorCourses.apiCall";
import { getUnreadCount } from "@/lib/apiCalls/chat/chat.apiCall";
import { getEnrollmentTrend } from "@/lib/apiCalls/analytics/getEnrollmentTrend.apiCall";
import { getRevenueAnalytics } from "@/lib/apiCalls/analytics/getRevenueAnalytics.apiCall";


export function useInstructorOverview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEarnings: 0,
    totalCourses: 0,
    averageRating: 0,
    pendingReviews: 0,
    unreadMessages: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      
      const analyticsResponse = await getInstructorAnalytics(null, 30);
      const analyticsData = analyticsResponse.data;

      
      const coursesResponse = await getAllInstructorCourses();
      const coursesData = coursesResponse.data || [];

      
      let unreadCount = 0;
      try {
        const unreadResponse = await getUnreadCount();
        unreadCount = unreadResponse.data?.unreadCount || 0;
      } catch (err) {
        console.warn("Could not fetch unread count:", err);
      }

      
      try {
        const enrollmentResponse = await getEnrollmentTrend(30, "day");
        setEnrollmentData(enrollmentResponse.data?.enrollments || []);
      } catch (err) {
        console.warn("Could not fetch enrollment trend:", err);
        setEnrollmentData([]);
      }

      
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const revenueResponse = await getRevenueAnalytics(
          startDate.toISOString(),
          endDate.toISOString()
        );
        const revenueByMonth = revenueResponse.data?.revenue_by_month || [];

        const chartData = revenueByMonth.map((item) => ({
          month: item.month,
          revenue: parseFloat(item.revenue),
          sales: item.sales,
        }));

        setRevenueData(chartData);
      } catch (err) {
        console.warn("Could not fetch revenue data:", err);
        setRevenueData([]);
      }

      
      const pendingReviews = Array.isArray(coursesData) 
        ? coursesData.filter(
            (course) => course.status === "pending" || course.status === "under_review"
          ).length
        : 0;

      
      setStats({
        totalStudents: analyticsData.overview?.totalEnrollments || 0,
        totalEarnings: analyticsData.overview?.totalRevenue || 0,
        totalCourses: Array.isArray(coursesData) ? coursesData.length : 0,
        averageRating: analyticsData.overview?.averageRating || 0,
        pendingReviews,
        unreadMessages: unreadCount,
      });

      
      const sortedCourses = Array.isArray(coursesData)
        ? coursesData
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6)
        : [];

      const coursesWithStats = sortedCourses.map((course) => {
        const courseAnalytics = analyticsData.courses?.find((c) => c.id === course.id);
        return {
          id: course.id,
          title: course.title,
          thumbnail_url: course.thumbnail_url || "https://via.placeholder.com/300x169",
          students: courseAnalytics?.enrollments || 0,
          rating: courseAnalytics?.averageRating || 0,
          status: course.status,
        };
      });

      setRecentCourses(coursesWithStats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentCourses,
    enrollmentData,
    revenueData,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
