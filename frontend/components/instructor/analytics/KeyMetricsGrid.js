import { Users, TrendingUp, BookOpen, Star } from "lucide-react";

export function KeyMetricsGrid({ analytics, formatNumber }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Total Students</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatNumber(analytics.overview?.totalEnrollments || 0)}
        </p>
        <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">Across all courses</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Active Students</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatNumber(analytics.overview?.activeStudents || 0)}
        </p>
        <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">Last 30 days</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Completion Rate</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {analytics.overview?.completionRate?.toFixed(1) || 0}%
        </p>
        <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">Average across courses</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Average Rating</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {analytics.overview?.averageRating?.toFixed(1) || "N/A"}
        </p>
        <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">From student reviews</p>
      </div>
    </div>
  );
}
