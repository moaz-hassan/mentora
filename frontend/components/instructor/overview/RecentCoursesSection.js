import Link from "next/link";
import { BookOpen, Plus, Users, Star } from "lucide-react";

function getStatusBadge(status) {
  const statusConfig = {
    approved: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    under_review: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    draft: "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-400",
  };
  return statusConfig[status] || "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-400";
}

function getStatusText(status) {
  const statusTexts = {
    approved: "Published",
    pending: "Pending",
    under_review: "Under Review",
    rejected: "Rejected",
    draft: "Draft",
  };
  return statusTexts[status] || status;
}

export function RecentCoursesSection({ courses }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Courses</h2>
        <Link
          href="/dashboard/instructor/courses"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          View All →
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-neutral-400 mb-4">You haven't created any courses yet</p>
          <Link
            href="/dashboard/instructor/create-course"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-neutral-900"
            >
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
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
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-neutral-400">
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
  );
}
