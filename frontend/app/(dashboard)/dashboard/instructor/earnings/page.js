"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  ArrowUpRight,
  
} from "lucide-react";
import { getRevenueAnalytics } from "@/lib/apiCalls/analytics/getRevenueAnalytics.apiCall";
import RevenueLineChart from "@/components/charts/RevenueLineChart";

export default function InstructorEarningsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, [timeRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on timeRange
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch revenue analytics
      const revenueResponse = await getRevenueAnalytics(
        startDate.toISOString(),
        endDate.toISOString()
      );
      const revenueData = revenueResponse.data;

      // Transform revenue data to match UI expectations
      const transformedEarnings = {
        summary: {
          totalRevenue: parseFloat(revenueData.total_revenue),
          // Note: Pending payout and last payout would need separate endpoints
          // For now, we'll calculate based on available data
          pendingPayout: parseFloat(revenueData.total_revenue) * 0.8, // Assuming 80% after platform fee
          lastPayout: 0, // Would need payment history endpoint
          lastPayoutDate: null,
          nextPayoutDate: getNextPayoutDate(),
        },
        byCourse: revenueData.revenue_by_course.map((course) => ({
          id: course.course_id,
          title: course.course_title,
          enrollments: course.sales, // Using sales as proxy for enrollments
          revenue: parseFloat(course.revenue),
          avgPrice: course.sales > 0 ? parseFloat(course.revenue) / course.sales : 0,
          refunds: 0, // Would need refund data from backend
        })),
        monthlyTrend: revenueData.revenue_by_month.map((item) => ({
          month: formatMonthLabel(item.month),
          revenue: parseFloat(item.revenue),
        })),
        transactions: [], // Would need transaction history endpoint
      };

      setEarnings(transformedEarnings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      setError("Failed to load earnings data. Please try again.");
      setLoading(false);
    }
  };

  const getNextPayoutDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString().split('T')[0];
  };

  const formatMonthLabel = (monthString) => {
    // Convert YYYY-MM to short month name
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button
            onClick={fetchEarnings}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="mt-2 text-gray-600">
            Track your revenue and manage payouts
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>

          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">
            {formatCurrency(earnings.summary.totalRevenue)}
          </p>
          <p className="text-sm opacity-75 mt-2">All time earnings</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-orange-600 font-medium">Pending</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Payout</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(earnings.summary.pendingPayout)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Next payout: {formatDate(earnings.summary.nextPayoutDate)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">Paid</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Last Payout</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(earnings.summary.lastPayout)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {formatDate(earnings.summary.lastPayoutDate)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Payout Schedule</p>
          <p className="text-lg font-bold text-gray-900">Monthly</p>
          <p className="text-sm text-gray-500 mt-2">
            Payouts on the 1st of each month
          </p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Revenue Trend
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Monthly revenue performance
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600">Revenue</span>
          </div>
        </div>
        <RevenueLineChart data={earnings.monthlyTrend} formatCurrency={formatCurrency} />
      </div>

      {/* Revenue by Course */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Revenue by Course
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Course
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Enrollments
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Avg Price
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Refunds
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Total Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {earnings.byCourse.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{course.title}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {course.enrollments.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatCurrency(course.avgPrice)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      {course.refunds}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900">
                    {formatCurrency(course.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Transactions
        </h2>
        {earnings.transactions && earnings.transactions.length > 0 ? (
          <div className="space-y-3">
            {earnings.transactions.map((transaction) => (
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
                      transaction.status === "completed"
                        ? "text-green-600"
                        : "text-red-600"
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

      {/* Payout Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Payout Information
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Payouts are processed monthly on the 1st of each month
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Minimum payout threshold is $50
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Platform fee: 20% of each transaction
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Update your payment method in settings to receive payouts
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
