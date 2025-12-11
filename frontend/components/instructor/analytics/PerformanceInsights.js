import { Activity, CheckCircle, Target } from "lucide-react";

export function PerformanceInsights({ analytics }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Performance Insights & Recommendations</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Strong Points</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• {analytics.overview?.activeStudents || 0} students active in last 30 days</li>
                <li>• Average completion rate of {analytics.overview?.completionRate?.toFixed(1) || 0}%</li>
                {analytics.quizAnalytics?.averageScore > 70 && (
                  <li>• Excellent quiz performance at {analytics.quizAnalytics.averageScore.toFixed(1)}%</li>
                )}
                {analytics.engagement?.chatParticipation > 50 && (
                  <li>
                    • High chat participation at {analytics.engagement.chatParticipation.toFixed(1)}%
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Areas for Improvement</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {analytics.overview?.completionRate < 50 && (
                  <li>• Consider breaking down complex lessons into smaller segments</li>
                )}
                {analytics.quizAnalytics?.averageScore < 60 && (
                  <li>• Quiz difficulty may need adjustment or more practice materials</li>
                )}
                {analytics.engagement?.chatParticipation < 30 && (
                  <li>• Encourage more discussion with prompts and questions</li>
                )}
                {analytics.studentProgress?.notStarted > analytics.studentProgress?.completed && (
                  <li>• Many students haven't started - consider sending reminders</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
