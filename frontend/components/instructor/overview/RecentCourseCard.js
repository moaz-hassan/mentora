import Link from "next/link";
import { Star, Users } from "lucide-react";

export function RecentCourseCard({ course }) {
  const getStatusBadge = (status) => {
    const badges = {
      approved: "bg-green-100 text-green-700",
      pending_review: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
      draft: "bg-gray-100 text-gray-700",
    };
    return badges[status] || badges.draft;
  };

  const getStatusText = (status) => {
    const texts = {
      approved: "Published",
      pending_review: "Pending Review",
      rejected: "Rejected",
      draft: "Draft",
    };
    return texts[status] || status;
  };

  return (
    <Link
      href={`/dashboard/instructor/courses/${course.id}/edit`}
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No thumbnail
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {course.title}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
              course.status
            )}`}
          >
            {getStatusText(course.status)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.students || 0} students</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
