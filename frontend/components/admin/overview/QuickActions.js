import { FileCheck, Users, AlertCircle, TrendingUp } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      label: "Review Courses",
      href: "/dashboard/admin/courses",
      icon: FileCheck,
      color: "blue",
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
      color: "purple",
    },
    {
      label: "View Reports",
      href: "/dashboard/admin/reports",
      icon: AlertCircle,
      color: "red",
    },
    {
      label: "View Analytics",
      href: "/dashboard/admin/analytics",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400",
      purple: "text-purple-600 dark:text-purple-400",
      red: "text-red-600 dark:text-red-400",
      orange: "text-orange-600 dark:text-orange-400",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-gray-200 dark:border-border p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
            >
              <Icon className={`w-5 h-5 ${getColorClasses(action.color)} mr-3`} />
              <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                {action.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

