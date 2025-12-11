"use client";

import {
  DollarSign,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AnalyticsCard,
  ChartWrapper,
  DataTable,
  FilterBar,
  ExportButton,
  AIInsightPanel,
} from "@/components/admin/shared";
import { useAdminAnalytics } from "@/hooks/admin";


const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
};

const usersChartConfig = {
  newUsers: { label: "New Users", color: "hsl(var(--chart-2))" },
  activeUsers: { label: "Active Users", color: "hsl(var(--chart-3))" },
};

const enrollmentsChartConfig = {
  enrollments: { label: "Enrollments", color: "hsl(var(--chart-4))" },
  completions: { label: "Completions", color: "hsl(var(--chart-5))" },
};


const courseColumns = [
  { accessorKey: "title", header: "Course" },
  { accessorKey: "instructor", header: "Instructor" },
  {
    accessorKey: "enrollments",
    header: "Enrollments",
    cell: ({ row }) => row.original.enrollments?.toLocaleString() || "0",
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(row.original.revenue || 0),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (row.original.rating ? `${row.original.rating.toFixed(1)} ⭐` : "N/A"),
  },
];

export default function AnalyticsDashboardPage() {
  const {
    loading,
    refreshing,
    error,
    dateRange,
    overview,
    revenueData,
    usersData,
    enrollmentsData,
    coursesData,
    aiInsights,
    handleRefresh,
    handleDateRangeChange,
    handleExport,
  } = useAdminAnalytics();

  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform performance and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <ExportButton onExport={handleExport} formats={["csv", "pdf"]} />
        </div>
      </div>

      {}
      <FilterBar
        showSearch={false}
        showStatus={false}
        showDateRange={true}
        onDateRangeChange={handleDateRangeChange}
        filters={{ dateRange }}
      />

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Revenue"
          value={overview?.totalRevenue || 0}
          change={overview?.revenueChange}
          changeLabel="vs last period"
          icon={DollarSign}
          format="currency"
          loading={loading}
        />
        <AnalyticsCard
          title="Total Users"
          value={overview?.totalUsers || 0}
          change={overview?.userGrowth}
          changeLabel="vs last period"
          icon={Users}
          loading={loading}
        />
        <AnalyticsCard
          title="Enrollments"
          value={overview?.totalEnrollments || 0}
          change={overview?.enrollmentChange}
          changeLabel="vs last period"
          icon={GraduationCap}
          loading={loading}
        />
        <AnalyticsCard
          title="Active Courses"
          value={overview?.activeCourses || 0}
          change={overview?.courseChange}
          changeLabel="vs last period"
          icon={BookOpen}
          loading={loading}
        />
      </div>

      {}
      <AIInsightPanel
        title="AI Insights"
        insights={aiInsights}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <ChartWrapper
            title="Revenue Trends"
            description="Daily revenue over the selected period"
            type="area"
            data={revenueData}
            config={revenueChartConfig}
            dataKeys={["revenue"]}
            xAxisKey="date"
            loading={loading}
            height={350}
          />
        </TabsContent>

        <TabsContent value="users">
          <ChartWrapper
            title="User Growth"
            description="New and active users over time"
            type="line"
            data={usersData}
            config={usersChartConfig}
            dataKeys={["newUsers", "activeUsers"]}
            xAxisKey="date"
            loading={loading}
            height={350}
          />
        </TabsContent>

        <TabsContent value="enrollments">
          <ChartWrapper
            title="Enrollment Trends"
            description="Enrollments and completions over time"
            type="bar"
            data={enrollmentsData}
            config={enrollmentsChartConfig}
            dataKeys={["enrollments", "completions"]}
            xAxisKey="date"
            loading={loading}
            height={350}
          />
        </TabsContent>
      </Tabs>

      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Top Performing Courses</h2>
            <p className="text-sm text-muted-foreground">
              Courses ranked by revenue and enrollments
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <DataTable
          columns={courseColumns}
          data={coursesData}
          loading={loading}
          searchKey="title"
          searchPlaceholder="Search courses..."
          pageSize={5}
        />
      </div>
    </div>
  );
}
