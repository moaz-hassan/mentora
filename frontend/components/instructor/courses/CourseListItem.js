import { useState } from "react";
import Link from "next/link";
import { Edit, BarChart3, Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function getStatusBadge(status) {
  const statusConfig = {
    approved: {
      label: "Approved",
      color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    },
    pending: {
      label: "Pending Review",
      color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    },
    pending_review: {
      label: "Pending Review",
      color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    },
    draft: {
      label: "Draft",
      color: "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-400",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

export function CourseListItem({ course, onDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Determine if the course status allows deletion (draft or rejected)
  const status = course.review_status || course.status;
  const canDelete = status === "draft" || status === "rejected";

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(course.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete course:", error);
    } finally {
      setDeleting(false);
    }
  };

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
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
                  {course.description || "No description"}
                </p>
              </div>
              {getStatusBadge(status)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-neutral-400 mt-4">
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

              {canDelete && onDelete && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Course</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{course.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

