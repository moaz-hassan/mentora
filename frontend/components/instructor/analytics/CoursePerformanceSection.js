import { Users, Star, Target } from "lucide-react";

export function CoursePerformanceSection({ courses, formatNumber }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Course Performance Overview</h2>
      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.id} className="border border-gray-200 dark:border-neutral-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formatNumber(course.enrollments || 0)} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {course.averageRating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {course.completionRate?.toFixed(1) || 0}% completion
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">Active Students</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(course.activeStudents || 0)}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">Avg Watch Time</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{course.avgWatchTime || 0} min</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">Quiz Avg Score</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {course.avgQuizScore?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">Discussion Posts</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatNumber(course.discussionPosts || 0)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
