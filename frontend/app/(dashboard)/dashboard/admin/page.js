
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Users,
  BookOpen,
  DollarSign,
  FileCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0, // Placeholder as no payment API yet
    pendingReviews: 0,
    activeStudents: 0, // Placeholder
    newEnrollments: 0, // Placeholder
    openReports: 0,
  });

  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Get token from cookies (authToken) or fallback to localStorage
  const getToken = () => {
    const cookieToken = Cookies.get("authToken");
    if (cookieToken) return cookieToken;
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, coursesRes, pendingCoursesRes, reportsStatsRes] = await Promise.all([
        fetch(`${API_URL}/api/users`, { headers }),
        fetch(`${API_URL}/api/courses`), // Public endpoint
        fetch(`${API_URL}/api/admin/courses/pending`, { headers }),
        fetch(`${API_URL}/api/reports/stats`, { headers }),
      ]);

      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      const pendingCoursesData = await pendingCoursesRes.json();
      const reportsStatsData = await reportsStatsRes.json();

      setStats({
        totalUsers: usersData.success ? usersData.count : 0,
        totalCourses: coursesData.success ? coursesData.count : 0,
        totalRevenue: 0, // Not implemented
        pendingReviews: pendingCoursesData.success ? pendingCoursesData.count : 0,
        activeStudents: 0, // Not implemented
        newEnrollments: 0, // Not implemented
        openReports: reportsStatsData.success ? reportsStatsData.stats.pending : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: "Total registered",
      changeType: "neutral",
      color: "blue",
    },
    {
      name: "Total Courses",
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      change: "Available courses",
      changeType: "neutral",
      color: "green",
    },
    {
      name: "Pending Reviews",
      value: stats.pendingReviews.toLocaleString(),
      icon: FileCheck,
      change: stats.pendingReviews > 0 ? "Needs attention" : "All clear",
      changeType: stats.pendingReviews > 0 ? "warning" : "positive",
      color: "orange",
    },
    {
      name: "Open Reports",
      value: stats.openReports.toLocaleString(),
      icon: AlertCircle,
      change: stats.openReports > 0 ? "Action required" : "All clear",
      changeType: stats.openReports > 0 ? "warning" : "positive",
      color: "red",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      indigo: "bg-indigo-100 text-indigo-600",
      pink: "bg-pink-100 text-pink-600",
      red: "bg-red-100 text-red-600",
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p
                    className={`mt-2 text-sm ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "warning"
                        ? "text-orange-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/dashboard/admin/courses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileCheck className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              Review Courses
            </span>
          </a>
          <a
            href="/dashboard/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              Manage Users
            </span>
          </a>
          <a
            href="/dashboard/admin/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              View Reports
            </span>
          </a>
          <a
            href="/dashboard/admin/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              View Analytics
            </span>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              action: "New course submitted for review",
              course: "Advanced React Patterns",
              instructor: "John Doe",
              time: "2 hours ago",
            },
            {
              action: "Chapter approved",
              course: "Python for Beginners",
              instructor: "Jane Smith",
              time: "5 hours ago",
            },
            {
              action: "New user registered",
              course: "Student Account",
              instructor: "Mike Johnson",
              time: "1 day ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-600">
                  {activity.course} • {activity.instructor}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
