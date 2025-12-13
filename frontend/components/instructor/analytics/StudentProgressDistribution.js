export function StudentProgressDistribution({ progress }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Student Progress Distribution</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="text-center p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">Not Started</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-400 dark:text-neutral-500">{progress.notStarted || 0}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">0%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">Just Started</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{progress.justStarted || 0}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">1-25%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">In Progress</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{progress.inProgress || 0}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">26-75%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">Almost Done</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{progress.almostDone || 0}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">76-99%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-green-50 dark:bg-green-900/20">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">Completed</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{progress.completed || 0}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">100%</p>
        </div>
      </div>
    </div>
  );
}

