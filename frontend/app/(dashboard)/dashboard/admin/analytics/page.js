"use client";

import { useState, useEffect, useCallback } from "react";
import { subDays } from "date-fns";
import {
  DollarSign,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

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
import { analyticsAPI } from "@/lib/api/admin";

// Chart configuration
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

// Course table columns
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Data states
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [enrollmentsData, setEnrollmentsData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const params = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      const [overviewRes, revenueRes, usersRes, enrollmentsRes, coursesRes] =
        await Promise.all([
          analyticsAPI.getOverview(params),
          analyticsAPI.getRevenue(params),
          analyticsAPI.getUsers(params),
          analyticsAPI.getEnrollments(params),
          analyticsAPI.getCourses(),
        ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
        // Generate AI insights from overview data
        generateAIInsights(overviewRes.data);
      }
      if (revenueRes.success) setRevenueData(revenueRes.data?.trend || []);
      if (usersRes.success) setUsersData(usersRes.data?.trend || []);
      if (enrollmentsRes.success) setEnrollmentsData(enrollmentsRes.data?.trend || []);
      if (coursesRes.success) setCoursesData(coursesRes.data?.courses || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateAIInsights = (data) => {
    const insights = [];

    // Revenue insight
    if (data?.revenueChange > 10) {
      insights.push({
        type: "trend_up",
        title: "Revenue Growth",
        description: `Revenue increased by ${data.revenueChange.toFixed(1)}% compared to the previous period. Consider expanding marketing efforts.`,
        priority: "medium",
      });
    } else if (data?.revenueChange < -10) {
      insights.push({
        type: "trend_down",
        title: "Revenue Decline",
        description: `Revenue decreased by ${Math.abs(data.revenueChange).toFixed(1)}%. Review pricing strategy and course offerings.`,
        priority: "high",
      });
    }

    // User growth insight
    if (data?.userGrowth > 15) {
      insights.push({
        type: "trend_up",
        title: "Strong User Growth",
        description: `User base grew by ${data.userGrowth.toFixed(1)}%. Great momentum - focus on retention strategies.`,
        priority: "low",
      });
    }

    // Enrollment insight
    if (data?.enrollmentRate < 5) {
      insights.push({
        type: "warning",
        title: "Low Enrollment Rate",
        description: "Enrollment rate is below average. Consider promotional campaigns or course discounts.",
        priority: "high",
        action: "View Marketing Tools",
      });
    }

    // Default insight if none generated
    if (insights.length === 0) {
      insights.push({
        type: "suggestion",
        title: "Platform Performance",
        description: "Platform metrics are stable. Continue monitoring for trends and opportunities.",
        priority: "low",
      });
    }

    setAiInsights(insights);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("Analytics refreshed");
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleExport = async (format) => {
    try {
      await analyticsAPI.exportData({
        format,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      });
      toast.success(`Export started - ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Export failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Filters */}
      <FilterBar
        showSearch={false}
        showStatus={false}
        showDateRange={true}
        onDateRangeChange={handleDateRangeChange}
        filters={{ dateRange }}
      />

      {/* Overview Cards */}
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

      {/* AI Insights */}
      <AIInsightPanel
        title="AI Insights"
        insights={aiInsights}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* Charts */}
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

      {/* Top Courses Table */}
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
