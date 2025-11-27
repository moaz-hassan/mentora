import Link from "next/link";
import { FileCheck, MessageSquare } from "lucide-react";

export function AlertsSection({ stats }) {
  if (stats.pendingReviews === 0 && stats.unreadMessages === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {stats.pendingReviews > 0 && (
        <Link
          href="/dashboard/instructor/pending-reviews"
          className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors block"
        >
          <div className="flex items-center">
            <FileCheck className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {stats.pendingReviews} Course{stats.pendingReviews > 1 ? "s" : ""} Pending Review
              </p>
              <p className="text-sm text-gray-600">
                Your submitted courses are awaiting admin approval
              </p>
            </div>
          </div>
        </Link>
      )}

      {stats.unreadMessages > 0 && (
        <Link
          href="/dashboard/instructor/chats"
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors block"
        >
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {stats.unreadMessages} Unread Message{stats.unreadMessages > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-gray-600">
                Students are waiting for your response
              </p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
