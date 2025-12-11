import Link from "next/link";

export function StatsCard({ name, value, icon: Icon, change, changeType, color, href }) {
  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    };
    return colors[color] || colors.blue;
  };

  return (
    <Link
      href={href}
      className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">{name}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p
            className={`mt-2 text-sm ${
              changeType === "positive"
                ? "text-green-600 dark:text-green-400"
                : changeType === "negative"
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-neutral-400"
            }`}
          >
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Link>
  );
}
