export function RecentActivity({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-gray-200 dark:border-border p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
          Recent Activity
        </h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-gray-200 dark:border-border p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
        Recent Activity
      </h2>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-muted-foreground">
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-muted/50"
            >
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-foreground">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {activity.course} • {activity.instructor}
                </p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground/70 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


