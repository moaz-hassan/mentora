import Link from "next/link";
import { Edit, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function getStatusBadge(status) {
  const statusConfig = {
    approved: {
      label: "Approved",
      color: "bg-green-100 text-green-700",
    },
    pending: {
      label: "Pending Review",
      color: "bg-yellow-100 text-yellow-700",
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-700",
    },
    draft: {
      label: "Draft",
      color: "bg-gray-100 text-gray-700",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

export function CourseListItem({ course }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400 text-sm">No thumbnail</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {course.description || "No description"}
                </p>
              </div>
              {getStatusBadge(course.review_status)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
              <span className="flex items-center gap-1">
                <span className="font-medium">Category:</span>
                {course.category || "Uncategorized"}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Level:</span>
                {course.level || "Not set"}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Price:</span>${course.price || "0"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Link href={`/dashboard/instructor/courses/${course.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Course
                </Button>
              </Link>

              <Link href={`/dashboard/instructor/analytics?courseId=${course.id}`}>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>

              <Link href={`/courses/${course.id}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
