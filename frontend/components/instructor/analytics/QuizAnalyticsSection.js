export function QuizAnalyticsSection({ quizzes, formatNumber }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quiz Performance Analysis</h2>
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 bg-gray-50 dark:bg-neutral-800/50">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h4>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                  {quiz.courseName} • {quiz.chapterName}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full self-start ${
                  quiz.passRate > 70
                    ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                    : quiz.passRate > 50
                    ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                    : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                }`}
              >
                {quiz.passRate?.toFixed(1) || 0}% pass rate
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-neutral-400">Attempts</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(quiz.attempts || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-neutral-400">Avg Score</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{quiz.avgScore?.toFixed(1) || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-neutral-400">Highest Score</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{quiz.highestScore || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-neutral-400">Lowest Score</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{quiz.lowestScore || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-neutral-400">Avg Time</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{quiz.avgTime || 0} min</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

