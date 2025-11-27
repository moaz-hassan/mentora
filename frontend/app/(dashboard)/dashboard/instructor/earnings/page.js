"use client";

import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";
import { useEarnings } from "@/hooks/earnings";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import ExportDialog from "@/components/ExportDialog";
import { RecentTransactionsSection } from "@/components/instructorDashboard/earnings";
import jsPDF from "jspdf";
import { useState } from "react";

export default function InstructorEarningsPage() {
  const { earnings, loading, error, timeRange, setTimeRange, refetch } = useEarnings();
  const [showExportDialog, setShowExportDialog] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("Earnings Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Time Range: Last ${timeRange} days`, 14, 33);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Total Revenue: ${formatCurrency(earnings.total_revenue || 0)}`, 14, 53);
    
    doc.save(`earnings-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    let csvContent = "Earnings Report\\n";
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\\n`;
    csvContent += `Time Range: Last ${timeRange} days\\n\\n`;
    
    csvContent += "Summary\\n";
    csvContent += `Total Revenue,${earnings.total_revenue || 0}\\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `earnings-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format) => {
    if (format === 'pdf') {
      exportToPDF();
    } else if (format === 'csv') {
      exportToCSV();
    }
    setShowExportDialog(false);
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
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!earnings) return null;

  const totalRevenue = parseFloat(earnings.total_revenue || 0);
  const pendingPayout = totalRevenue * 0.8;
  const revenueByCourse = earnings.revenue_by_course || [];
  const monthlyTrend = (earnings.revenue_by_month || []).map(item => ({
    month: item.month,
    revenue: parseFloat(item.revenue),
  }));

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
            <option value="1month">Last month</option>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
          </select>

          <button 
            onClick={() => setShowExportDialog(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        title="Export Earnings Report"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
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
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(pendingPayout)}</p>
          <p className="text-sm text-gray-500 mt-2">Next payout: 1st of next month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">Paid</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Last Payout</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(0)}</p>
          <p className="text-sm text-gray-500 mt-2">N/A</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Payout Schedule</p>
          <p className="text-lg font-bold text-gray-900">Monthly</p>
          <p className="text-sm text-gray-500 mt-2">Payouts on the 1st of each month</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      {monthlyTrend.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-600 mt-1">Monthly revenue performance</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
          </div>
          <RevenueLineChart data={monthlyTrend} formatCurrency={formatCurrency} />
        </div>
      )}

      {/* Revenue by Course */}
      {revenueByCourse.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Course</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Sales</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueByCourse.map((course, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{course.course_title}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{course.sales}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {formatCurrency(parseFloat(course.revenue))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <RecentTransactionsSection 
        transactions={[]} 
        formatCurrency={formatCurrency} 
        formatDate={formatDate} 
      />

      {/* Payout Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Payout Information</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Payouts are processed monthly on the 1st of each month</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Minimum payout threshold is $50</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Platform fee: 20% of each transaction</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Update your payment method in settings to receive payouts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
