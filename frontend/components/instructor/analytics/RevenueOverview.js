export function RevenueOverview({ overview, formatCurrency, formatNumber }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Revenue Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
          <p className="text-sm opacity-90 mb-2">Total Revenue</p>
          <p className="text-4xl font-bold">{formatCurrency(overview.totalRevenue || 0)}</p>
          <p className="text-sm opacity-75 mt-2">
            From {formatNumber(overview.totalEnrollments || 0)} enrollments
          </p>
        </div>
        <div className="p-6 border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">Average Revenue per Student</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {overview.totalEnrollments > 0
              ? formatCurrency((overview.totalRevenue || 0) / overview.totalEnrollments)
              : formatCurrency(0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">Across all courses</p>
        </div>
        <div className="p-6 border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">Revenue Growth</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            +{overview.revenueGrowth?.toFixed(1) || 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">vs previous period</p>
        </div>
      </div>
    </div>
  );
}
