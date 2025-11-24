"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  FileCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    activeStudents: 0,
    newEnrollments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real stats from API
    // Placeholder data for now
    setStats({
      totalUsers: 1234,
      totalCourses: 156,
      totalRevenue: 45678.90,
      pendingReviews: 12,
      activeStudents: 892,
      newEnrollments: 45,
    });
    setLoading(false);
  }, []);

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: "+12%",
      changeType: "positive",
      color: "blue",
    },
    {
      name: "Total Courses",
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      change: "+8%",
      changeType: "positive",
      color: "green",
    },
    {
      name: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+23%",
      changeType: "positive",
      color: "purple",
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
      name: "Active Students",
      value: stats.activeStudents.toLocaleString(),
      icon: TrendingUp,
      change: "+15%",
      changeType: "positive",
      color: "indigo",
    },
    {
      name: "New Enrollments",
      value: stats.newEnrollments.toLocaleString(),
      icon: AlertCircle,
      change: "Last 7 days",
      changeType: "neutral",
      color: "pink",
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            href="/dashboard/admin/courses/pending"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileCheck className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              Review Courses
            </span>
          </a>
          <a
            href="/dashboard/admin/chapters/pending"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileCheck className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              Review Chapters
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
