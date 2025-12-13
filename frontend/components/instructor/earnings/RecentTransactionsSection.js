export function RecentTransactionsSection({ transactions, formatCurrency, formatDate }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Transactions</h2>
      {transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-neutral-800 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{transaction.course}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  {transaction.student} • {formatDate(transaction.date)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    transaction.status === "completed"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {transaction.status === "completed" ? "Completed" : "Refunded"}
                </span>
                <span
                  className={`text-lg font-bold ${
                    transaction.status === "completed" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
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
        <div className="text-center py-8 text-gray-500 dark:text-neutral-500">
          <p>No recent transactions available</p>
          <p className="text-sm mt-2">Transaction history will appear here once you have sales</p>
        </div>
      )}
    </div>
  );
}
