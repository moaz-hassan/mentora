"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, User } from "lucide-react";

export function CourseApprovalDialog({
  open,
  onOpenChange,
  course,
  action,
  rejectionReason,
  onRejectionReasonChange,
  onApprove,
  onReject,
}) {
  const handleAction = () => {
    if (action === "approve") {
      onApprove(course?.id);
    } else {
      onReject(course?.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-0 overflow-hidden">
        <div className={`px-6 py-5 ${action === "approve" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {action === "approve" ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <XCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold text-white">
                {action === "approve" ? "Approve Course" : "Reject Course"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/80 text-sm">
                {action === "approve" ? "Make this course live for students" : "Send back for revision"}
              </AlertDialogDescription>
            </div>
          </div>
        </div>
        
       
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-gray-100 dark:border-neutral-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-400 font-medium mb-1">Course</p>
            <p className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{course?.title}</p>
            {course?.Instructor && (
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                {course.Instructor.first_name} {course.Instructor.last_name}
              </p>
            )}
          </div>

          <p className="text-gray-600 dark:text-neutral-300 text-sm">
            {action === "approve"
              ? "This course will be published and become visible to all students. They will be able to enroll and access the content immediately."
              : "The instructor will be notified via email and can make revisions based on your feedback."}
          </p>

          {action === "reject" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => onRejectionReasonChange(e.target.value)}
                placeholder="Explain why this course needs revision..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 transition-all"
                rows={4}
              />
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-neutral-400">Minimum 10 characters</span>
                <span className={rejectionReason.length >= 10 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400'}>
                  {rejectionReason.length}/10
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-900/50 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-3">
          <AlertDialogCancel className="px-5 py-2.5">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={action === "reject" && rejectionReason.length < 10}
            className={`px-5 py-2.5 font-medium flex items-center gap-2 ${action === "approve" 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {action === "approve" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve Course
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Reject Course
              </>
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
