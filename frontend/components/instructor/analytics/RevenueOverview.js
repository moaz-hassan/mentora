export function RevenueOverview({ overview, formatCurrency, formatNumber }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
          <p className="text-sm opacity-90 mb-2">Total Revenue</p>
          <p className="text-4xl font-bold">{formatCurrency(overview.totalRevenue || 0)}</p>
          <p className="text-sm opacity-75 mt-2">
            From {formatNumber(overview.totalEnrollments || 0)} enrollments
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Average Revenue per Student</p>
          <p className="text-4xl font-bold text-gray-900">
            {overview.totalEnrollments > 0
              ? formatCurrency((overview.totalRevenue || 0) / overview.totalEnrollments)
              : formatCurrency(0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Across all courses</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Revenue Growth</p>
          <p className="text-4xl font-bold text-green-600">
            +{overview.revenueGrowth?.toFixed(1) || 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">vs previous period</p>
        </div>
      </div>
    </div>
  );
}
