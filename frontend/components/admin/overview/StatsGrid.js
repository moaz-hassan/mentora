import {
  Users,
  BookOpen,
  FileCheck,
  AlertCircle,
} from "lucide-react";

export function StatsGrid({ stats }) {
  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: "Total registered",
      changeType: "neutral",
      color: "blue",
    },
    {
      name: "Total Courses",
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      change: "Available courses",
      changeType: "neutral",
      color: "green",
    },
    {
      name: "Pending Reviews",
      value: stats.pendingReviews.toLocaleString(),
      icon: FileCheck,
      change: stats.pendingReviews > 0 ? "Needs attention" : "All clear",
      changeType: stats.pendingReviews > 0 ? "warning" : "positive",
      color: "orange",
    },
    {
      name: "Open Reports",
      value: stats.openReports.toLocaleString(),
      icon: AlertCircle,
      change: stats.openReports > 0 ? "Action required" : "All clear",
      changeType: stats.openReports > 0 ? "warning" : "positive",
      color: "red",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
      pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white dark:bg-card rounded-lg shadow-sm border border-gray-200 dark:border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-foreground">{stat.value}</p>
                <p
                  className={`mt-2 text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600 dark:text-green-400"
                      : stat.changeType === "warning"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-gray-600 dark:text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

