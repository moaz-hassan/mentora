export function QuizAnalyticsSection({ quizzes, formatNumber }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Performance Analysis</h2>
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {quiz.courseName} • {quiz.chapterName}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  quiz.passRate > 70
                    ? "bg-green-100 text-green-700"
                    : quiz.passRate > 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {quiz.passRate?.toFixed(1) || 0}% pass rate
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-600">Attempts</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(quiz.attempts || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Score</p>
                <p className="text-lg font-bold text-purple-600">{quiz.avgScore?.toFixed(1) || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Highest Score</p>
                <p className="text-lg font-bold text-green-600">{quiz.highestScore || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Lowest Score</p>
                <p className="text-lg font-bold text-red-600">{quiz.lowestScore || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Time</p>
                <p className="text-lg font-bold text-blue-600">{quiz.avgTime || 0} min</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
