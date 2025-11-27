import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function EnrollmentTrendChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxEnrollments = Math.max(...data.map((e) => e.enrollments));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Enrollment Trend</h2>
          <p className="text-sm text-gray-600 mt-1">Student enrollments over time</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-gradient-to-t from-purple-600 to-purple-400 rounded"></div>
          <span className="text-gray-600">Enrollments</span>
        </div>
      </div>
      <div className="flex items-end justify-between h-64 gap-2">
        {data.map((item, index) => {
          const height = maxEnrollments > 0 ? (item.enrollments / maxEnrollments) * 100 : 0;
          const isPositive = index === 0 || item.enrollments >= data[index - 1].enrollments;
          return (
            <div key={item.date} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center mb-2">
                <span className="text-sm font-semibold text-gray-900 mb-1">{item.enrollments}</span>
                {index > 0 && data[index - 1].enrollments > 0 && (
                  <span className={`text-xs flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  </span>
                )}
              </div>
              <div
                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t hover:from-purple-700 hover:to-purple-500 transition-colors cursor-pointer"
                style={{ height: `${height}%`, minHeight: "40px" }}
                title={`${item.date}: ${item.enrollments} enrollments`}
              ></div>
              <span className="text-xs text-gray-600 mt-2 truncate max-w-full">
                {item.date.length > 10 ? item.date.substring(5) : item.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
