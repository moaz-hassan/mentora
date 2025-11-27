export function StudentProgressDistribution({ progress }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Progress Distribution</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Not Started</p>
          <p className="text-3xl font-bold text-gray-400">{progress.notStarted || 0}</p>
          <p className="text-xs text-gray-500 mt-1">0%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Just Started</p>
          <p className="text-3xl font-bold text-red-600">{progress.justStarted || 0}</p>
          <p className="text-xs text-gray-500 mt-1">1-25%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">{progress.inProgress || 0}</p>
          <p className="text-xs text-gray-500 mt-1">26-75%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Almost Done</p>
          <p className="text-3xl font-bold text-blue-600">{progress.almostDone || 0}</p>
          <p className="text-xs text-gray-500 mt-1">76-99%</p>
        </div>
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-600">{progress.completed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">100%</p>
        </div>
      </div>
    </div>
  );
}
