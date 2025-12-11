import Link from "next/link";
import { Edit, BarChart3, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const statusConfig = {
  draft: {
    label: "Draft",
    icon: Clock,
    color: "bg-gray-100 text-gray-700",
    borderColor: "border-gray-300",
  },
  pending: {
    label: "Pending Review",
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-700",
    borderColor: "border-yellow-300",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "bg-green-100 text-green-700",
    borderColor: "border-green-300",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
    borderColor: "border-red-300",
  },
};

export function CourseCard({ course }) {
  const config = statusConfig[course.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="w-12 h-12" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 mb-1">
              {course.title}
            </h3>
            {course.category && (
              <p className="text-sm text-gray-600 capitalize">{course.category}</p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.color}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link href={`/dashboard/instructor/courses/${course.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/instructor/analytics/${course.id}`}>
            <Button variant="outline" size="icon">
              <BarChart3 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
