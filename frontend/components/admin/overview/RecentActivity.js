export function RecentActivity({ activities = [], loading = false }) {
  // Default activities if none provided
  const defaultActivities = [
    {
      id: 1,
      action: "New course submitted for review",
      course: "Advanced React Patterns",
      instructor: "John Doe",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Chapter approved",
      course: "Python for Beginners",
      instructor: "Jane Smith",
      time: "5 hours ago",
    },
    {
      id: 3,
      action: "New user registered",
      course: "Student Account",
      instructor: "Mike Johnson",
      time: "1 day ago",
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
          >
            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.action}
              </p>
              <p className="text-sm text-gray-600">
                {activity.course} • {activity.instructor}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
