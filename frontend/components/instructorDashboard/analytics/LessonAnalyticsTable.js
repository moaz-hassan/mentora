import { PlayCircle } from "lucide-react";

export function LessonAnalyticsTable({ lessons, formatNumber }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Lesson Performance</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Lesson</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Views</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Completion Rate</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Avg Watch Time</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.courseName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{formatNumber(lesson.views || 0)}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${lesson.completionRate || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{lesson.completionRate?.toFixed(1) || 0}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{lesson.avgWatchTime || 0} min</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      lesson.engagement > 70
                        ? "bg-green-100 text-green-700"
                        : lesson.engagement > 40
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {lesson.engagement?.toFixed(0) || 0}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
