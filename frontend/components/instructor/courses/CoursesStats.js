import { BarChart3, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CoursesStats({ courses }) {
  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BarChart3,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Approved",
      value: courses.filter((c) => c.status === "approved").length,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      textColor: "text-green-600",
    },
    {
      label: "Pending",
      value: courses.filter((c) => c.status === "pending").length,
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-600",
      textColor: "text-yellow-600",
    },
    {
      label: "Drafts",
      value: courses.filter((c) => c.status === "draft").length,
      icon: Clock,
      color: "bg-gray-100 text-gray-600",
      textColor: "text-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.textColor || 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
