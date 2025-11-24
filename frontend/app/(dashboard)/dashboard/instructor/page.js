"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  BookOpen,
  Star,
  Plus,
  FileCheck,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/instructorDashboard/overview";
import { getInstructorAnalytics } from "@/lib/apiCalls/instructor/getAnalytics.apiCall";
import { getAllInstructorCourses } from "@/lib/apiCalls/instructor/getAllInstructorCourses.apiCall";
import { getUnreadCount } from "@/lib/apiCalls/chat/chat.service";
import { getEnrollmentTrend } from "@/lib/apiCalls/analytics/getEnrollmentTrend.apiCall";
import { getRevenueAnalytics } from "@/lib/apiCalls/analytics/getRevenueAnalytics.apiCall";
import EnrollmentChart from "@/components/charts/EnrollmentChart";
import RevenueChart from "@/components/charts/RevenueChart";

export default function InstructorOverviewPage() {
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

  useEffect(() => {
    fetchInstructorStats();
  }, []);

  const fetchInstructorStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data
      const analyticsResponse = await getInstructorAnalytics(null, 30);
      const analyticsData = analyticsResponse.data;

      // Fetch all courses
      const coursesResponse = await getAllInstructorCourses();
      const coursesData = coursesResponse.data;

      // Fetch unread messages count
      let unreadCount = 0;
      try {
        const unreadResponse = await getUnreadCount();
        unreadCount = unreadResponse.data?.unreadCount || 0;
      } catch (err) {
        console.warn("Could not fetch unread count:", err);
      }

      // Fetch enrollment trend data (last 30 days)
      try {
        const enrollmentResponse = await getEnrollmentTrend(30, 'day');
        const enrollmentTrend = enrollmentResponse.data?.enrollments || [];
        setEnrollmentData(enrollmentTrend);
      } catch (err) {
        console.warn("Could not fetch enrollment trend:", err);
        setEnrollmentData([]);
      }

      // Fetch revenue data (last 6 months)
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        
        const revenueResponse = await getRevenueAnalytics(
          startDate.toISOString(),
          endDate.toISOString()
        );
        const revenueByMonth = revenueResponse.data?.revenue_by_month || [];
        
        // Transform data for chart
        const chartData = revenueByMonth.map(item => ({
          month: item.month,
          revenue: parseFloat(item.revenue),
          sales: item.sales
        }));
        
        setRevenueData(chartData);
      } catch (err) {
        console.warn("Could not fetch revenue data:", err);
        setRevenueData([]);
      }

      // Count pending reviews (courses with status 'pending' or 'under_review')
      const pendingReviews = coursesData.filter(
        (course) => course.status === "pending" || course.status === "under_review"
      ).length;

      // Set stats from analytics data
      setStats({
        totalStudents: analyticsData.overview?.totalEnrollments || 0,
        totalEarnings: analyticsData.overview?.totalRevenue || 0,
        totalCourses: coursesData.length,
        averageRating: analyticsData.overview?.averageRating || 0,
        pendingReviews,
        unreadMessages: unreadCount,
      });

      // Set recent courses (limit to 6 most recent)
      const sortedCourses = coursesData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

      // Get enrollment counts for each course from analytics
      const coursesWithStats = sortedCourses.map((course) => {
        const courseAnalytics = analyticsData.courses?.find(
          (c) => c.id === course.id
        );
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
      console.error("Error fetching instructor stats:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      under_review: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
      draft: "bg-gray-100 text-gray-700",
    };
    return statusConfig[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      approved: "Published",
      pending: "Pending",
      under_review: "Under Review",
      rejected: "Rejected",
      draft: "Draft",
    };
    return statusTexts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const statCards = [
    {
      name: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      change: "Across all courses",
      changeType: "neutral",
      href: "/dashboard/instructor/analytics",
    },
    {
      name: "Total Earnings",
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      change: "All time earnings",
      changeType: "positive",
      href: "/dashboard/instructor/earnings",
    },
    {
      name: "Total Courses",
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      change: `${stats.pendingReviews} pending review`,
      changeType: stats.pendingReviews > 0 ? "warning" : "neutral",
      href: "/dashboard/instructor/courses",
    },
    {
      name: "Average Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      change: "Across all courses",
      changeType: "positive",
      href: "/dashboard/instructor/analytics",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button
            onClick={fetchInstructorStats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's an overview of your teaching performance.
          </p>
        </div>
        <Link
          href="/dashboard/instructor/create-course"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Course
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Alerts */}
      {(stats.pendingReviews > 0 || stats.unreadMessages > 0) && (
        <div className="space-y-4">
          {stats.pendingReviews > 0 && (
            <Link
              href="/dashboard/instructor/pending-reviews"
              className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors block"
            >
              <div className="flex items-center">
                <FileCheck className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.pendingReviews} Course{stats.pendingReviews > 1 ? 's' : ''} Pending Review
                  </p>
                  <p className="text-sm text-gray-600">
                    Your submitted courses are awaiting admin approval
                  </p>
                </div>
              </div>
            </Link>
          )}

          {stats.unreadMessages > 0 && (
            <Link
              href="/dashboard/instructor/chats"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors block"
            >
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.unreadMessages} Unread Message{stats.unreadMessages > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    Students are waiting for your response
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Enrollment Trend</h2>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
            <Link
              href="/dashboard/instructor/analytics"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </Link>
          </div>
          <EnrollmentChart data={enrollmentData} />
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-600">Last 6 months</p>
            </div>
            <Link
              href="/dashboard/instructor/earnings"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </Link>
          </div>
          <RevenueChart data={revenueData} formatCurrency={formatCurrency} />
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
          <Link
            href="/dashboard/instructor/courses"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't created any courses yet</p>
            <Link
              href="/dashboard/instructor/create-course"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course) => (
              <div
                key={course.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        course.status
                      )}`}
                    >
                      {getStatusText(course.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students} students
                    </div>
                    {course.rating > 0 && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        {course.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/instructor/earnings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Earnings</span>
          </Link>

          <Link
            href="/dashboard/instructor/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Analytics</span>
          </Link>

          <Link
            href="/dashboard/instructor/chats"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Check Messages</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
