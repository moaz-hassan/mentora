import Link from "next/link";

export function StatsCard({ name, value, icon: Icon, change, changeType, color, href }) {
  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{name}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p
            className={`mt-2 text-sm ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-gray-600"
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
