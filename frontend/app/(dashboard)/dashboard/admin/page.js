
"use client";

import { useAdminOverview } from "@/hooks/admin";
import {
  OverviewHeader,
  StatsGrid,
  QuickActions,
  RecentActivity,
  AlertsSection,
} from "@/components/admin/overview";

export default function AdminOverviewPage() {
  const { stats, recentActivity, loading, error, refetch } = useAdminOverview();

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

  return (
    <div className="space-y-6 p-6">
      <OverviewHeader />
      
      <StatsGrid stats={stats} />
      
      <AlertsSection stats={stats} />
      
      <QuickActions />
      
      <RecentActivity activities={recentActivity} loading={false} />
    </div>
  );
}
