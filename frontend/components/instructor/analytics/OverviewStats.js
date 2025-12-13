import { Users, TrendingUp, Target, Award, DollarSign, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function OverviewStats({ overview }) {
  const stats = [
    {
      label: "Total Enrollments",
      value: overview.totalEnrollments.toLocaleString(),
      icon: Users,
      color: "blue",
      change: "+12%",
    },
    {
      label: "Active Students",
      value: overview.activeStudents.toLocaleString(),
      icon: TrendingUp,
      color: "green",
      change: "+8%",
    },
    {
      label: "Completion Rate",
      value: `${overview.completionRate}%`,
      icon: Target,
      color: "purple",
      change: "+5%",
    },
    {
      label: "Average Rating",
      value: overview.averageRating.toFixed(1),
      icon: Award,
      color: "yellow",
      change: "+0.2",
    },
    {
      label: "Total Revenue",
      value: `$${overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      change: "+18%",
    },
    {
      label: "Avg Watch Time",
      value: `${overview.averageWatchTime}h`,
      icon: Clock,
      color: "indigo",
      change: "+0.5h",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
      green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
      purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
      yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400" },
      indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
                  <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
