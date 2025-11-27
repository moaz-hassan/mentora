import { Users, TrendingUp, BookOpen, Star } from "lucide-react";

export function KeyMetricsGrid({ analytics, formatNumber }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Total Students</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatNumber(analytics.overview?.totalEnrollments || 0)}
        </p>
        <p className="text-sm text-gray-500 mt-2">Across all courses</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Active Students</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatNumber(analytics.overview?.activeStudents || 0)}
        </p>
        <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
        <p className="text-3xl font-bold text-gray-900">
          {analytics.overview?.completionRate?.toFixed(1) || 0}%
        </p>
        <p className="text-sm text-gray-500 mt-2">Average across courses</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Average Rating</p>
        <p className="text-3xl font-bold text-gray-900">
          {analytics.overview?.averageRating?.toFixed(1) || "N/A"}
        </p>
        <p className="text-sm text-gray-500 mt-2">From student reviews</p>
      </div>
    </div>
  );
}
