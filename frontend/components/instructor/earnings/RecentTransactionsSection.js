export function RecentTransactionsSection({ transactions, formatCurrency, formatDate }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
      {transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{transaction.course}</p>
                <p className="text-sm text-gray-600">
                  {transaction.student} • {formatDate(transaction.date)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    transaction.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.status === "completed" ? "Completed" : "Refunded"}
                </span>
                <span
                  className={`text-lg font-bold ${
                    transaction.status === "completed" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.status === "completed" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No recent transactions available</p>
          <p className="text-sm mt-2">Transaction history will appear here once you have sales</p>
        </div>
      )}
    </div>
  );
}
