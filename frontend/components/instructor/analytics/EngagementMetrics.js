import { MessageSquare, Clock, Award } from "lucide-react";

export function EngagementMetrics({ engagement, quizAnalytics }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Engagement Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Chat Participation</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {engagement.chatParticipation?.toFixed(1) || 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Students active in discussions</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Avg Session Duration</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {engagement.averageSessionDuration || 0} min
          </p>
          <p className="text-xs text-gray-500 mt-1">Time spent per session</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-600">Quiz Performance</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {quizAnalytics?.averageScore?.toFixed(1) || 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Average quiz score</p>
        </div>
      </div>
    </div>
  );
}
