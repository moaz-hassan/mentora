import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export function AlertsSection({ stats }) {
  const alerts = [];

  if (stats.pendingReviews > 0) {
    alerts.push({
      type: "warning",
      message: `You have ${stats.pendingReviews} course${
        stats.pendingReviews > 1 ? "s" : ""
      } pending review`,
      actionUrl: "/dashboard/admin/courses",
      actionText: "Review Courses",
    });
  }

  if (stats.openReports > 0) {
    alerts.push({
      type: "warning",
      message: `You have ${stats.openReports} open report${
        stats.openReports > 1 ? "s" : ""
      } requiring attention`,
      actionUrl: "/dashboard/admin/reports",
      actionText: "View Reports",
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-300">
              All Clear!
            </h3>
            <p className="text-sm text-green-800 dark:text-green-400 mt-1">
              No pending actions required at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6"
        >
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                Action Required
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-400 mt-1">{alert.message}</p>
              {alert.actionUrl && (
                <Link
                  href={alert.actionUrl}
                  className="inline-block mt-3 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                >
                  {alert.actionText} →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

