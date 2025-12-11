import Link from "next/link";
import { DollarSign, TrendingUp, MessageSquare } from "lucide-react";

export function QuickActionsSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/instructor/earnings"
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <DollarSign className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-sm font-medium text-gray-900">View Earnings</span>
        </Link>

        <Link
          href="/dashboard/instructor/analytics"
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
          <span className="text-sm font-medium text-gray-900">View Analytics</span>
        </Link>

        <Link
          href="/dashboard/instructor/chats"
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-orange-600 mr-3" />
          <span className="text-sm font-medium text-gray-900">Check Messages</span>
        </Link>
      </div>
    </div>
  );
}
