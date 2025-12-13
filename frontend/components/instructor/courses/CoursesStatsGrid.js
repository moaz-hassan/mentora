import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, CheckCircle, AlertCircle, Clock } from "lucide-react";

export function CoursesStatsGrid({ courses }) {
  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BarChart3,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Approved",
      value: courses.filter((c) => c.status === "approved").length,
      icon: CheckCircle,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Pending",
      value: courses.filter((c) => c.status === "pending").length,
      icon: AlertCircle,
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Drafts",
      value: courses.filter((c) => c.status === "draft").length,
      icon: Clock,
      bgColor: "bg-gray-100 dark:bg-neutral-800",
      textColor: "text-gray-600 dark:text-neutral-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
