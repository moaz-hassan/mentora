export function DailyEngagementChart({ data }) {
  if (!data || data.length === 0) return null;

  const displayData = data.slice(-14);
  const maxEngagement = Math.max(...displayData.map((d) => d.activeStudents));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Daily Course Engagement</h2>
          <p className="text-sm text-gray-600 mt-1">Student activity across all courses</p>
        </div>
      </div>
      <div className="flex items-end justify-between h-64 gap-2">
        {displayData.map((item, index) => {
          const height = maxEngagement > 0 ? (item.activeStudents / maxEngagement) * 100 : 0;
          return (
            <div key={item.date} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center mb-2">
                <span className="text-xs font-semibold text-gray-900">{item.activeStudents}</span>
              </div>
              <div
                className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t hover:from-green-700 hover:to-green-500 transition-colors cursor-pointer"
                style={{ height: `${height}%`, minHeight: "30px" }}
                title={`${item.date}: ${item.activeStudents} active students`}
              ></div>
              <span className="text-xs text-gray-600 mt-2 truncate max-w-full">
                {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
