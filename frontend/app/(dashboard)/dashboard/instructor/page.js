"use client";

import Link from "next/link";
import { Plus, Users, DollarSign, BookOpen, Star } from "lucide-react";
import { StatsCard } from "@/components/instructor/overview";
import { useInstructorOverview } from "@/hooks/course";
import EnrollmentChart from "@/components/charts/EnrollmentChart";
import RevenueChart from "@/components/charts/RevenueChart";
import { OverviewHeader, AlertsSection, RecentCoursesSection, QuickActionsSection } from "@/components/instructor/overview";

export default function InstructorOverviewPage() {
  const {
    stats,
    recentCourses,
    enrollmentData,
    revenueData,
    loading,
    error,
    refetch,
  } = useInstructorOverview();

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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={refetch}
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
      <OverviewHeader />

      {}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      <AlertsSection stats={stats} />

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enrollment Trend</h2>
              <p className="text-sm text-gray-600 dark:text-neutral-400">Last 30 days</p>
            </div>
            <Link
              href="/dashboard/instructor/analytics"
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              View Details →
            </Link>
          </div>
          <EnrollmentChart data={enrollmentData} />
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
              <p className="text-sm text-gray-600 dark:text-neutral-400">Last 6 months</p>
            </div>
            <Link
              href="/dashboard/instructor/earnings"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View Details →
            </Link>
          </div>
          <RevenueChart data={revenueData} formatCurrency={formatCurrency} />
        </div>
      </div>

      <RecentCoursesSection courses={recentCourses} />
      <QuickActionsSection />
    </div>
  );
}
