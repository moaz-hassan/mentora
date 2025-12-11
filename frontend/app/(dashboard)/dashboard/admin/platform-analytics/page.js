"use client";

import { useState, useEffect, useCallback } from "react";
import { subDays } from "date-fns";
import {
  BarChart3,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AnalyticsCard,
  ChartWrapper,
  DataTable,
  FilterBar,
  ExportButton,
} from "@/components/admin/shared";
import {
  getPlatformOverview,
  getAdminRevenueAnalytics,
  getUserGrowthAnalytics,
  getEnrollmentAnalytics,
  getCoursePerformanceAnalytics,
  exportAnalyticsData
} from "@/lib/apiCalls/admin/analytics.apiCall";


const enrollmentChartConfig = {
  enrollments: { label: "Enrollments", color: "hsl(var(--chart-1))" },
  completions: { label: "Completions", color: "hsl(var(--chart-2))" },
};

const paymentChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  refunds: { label: "Refunds", color: "hsl(var(--chart-4))" },
};

const userChartConfig = {
  newUsers: { label: "New Users", color: "hsl(var(--chart-2))" },
  activeUsers: { label: "Active Users", color: "hsl(var(--chart-3))" },
};

const courseChartConfig = {
  published: { label: "Published", color: "hsl(var(--chart-1))" },
  pending: { label: "Pending", color: "hsl(var(--chart-5))" },
};

export default function PlatformAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [courseData, setCourseData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const params = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      const [enrollmentsRes, paymentsRes, usersRes, coursesRes] = await Promise.all([
        getEnrollmentAnalytics(params),
        getAdminRevenueAnalytics(params),
        getUserGrowthAnalytics(params),
        getCoursePerformanceAnalytics(params),
      ]);

      if (enrollmentsRes.success) setEnrollmentData(enrollmentsRes.data);
      if (paymentsRes.success) setPaymentData(paymentsRes.data);
      if (usersRes.success) setUserData(usersRes.data);
      if (coursesRes.success) setCourseData(coursesRes.data);
    } catch (error) {
      console.error("Error fetching platform analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      await exportAnalyticsData({
        format,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      });
      toast.success(`Export started - ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Export failed");
    }
  };

  
  const topCoursesColumns = [
    {
      accessorKey: "title",
      header: "Course",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "enrollments",
      header: "Enrollments",
      cell: ({ row }) => row.original.enrollments?.toLocaleString() || 0,
    },
    {
      accessorKey: "completionRate",
      header: "Completion Rate",
      cell: ({ row }) => `${(row.original.completionRate || 0).toFixed(1)}%`,
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
      cell: ({ row }) =>
        row.original.rating ? `${row.original.rating.toFixed(1)} ⭐` : "N/A",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform performance insights
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
          <ExportButton onExport={handleExport} formats={["csv", "pdf", "excel"]} />
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
          title="Total Enrollments"
          value={enrollmentData?.total || 0}
          change={enrollmentData?.change}
          changeLabel="vs last period"
          icon={GraduationCap}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={paymentData?.totalRevenue || 0}
          change={paymentData?.revenueChange}
          changeLabel="vs last period"
          icon={CreditCard}
          format="currency"
          loading={loading}
        />
        <AnalyticsCard
          title="Active Users"
          value={userData?.activeUsers || 0}
          change={userData?.activeChange}
          changeLabel="vs last period"
          icon={Users}
          loading={loading}
        />
        <AnalyticsCard
          title="Published Courses"
          value={courseData?.published || 0}
          change={courseData?.publishedChange}
          changeLabel="vs last period"
          icon={BookOpen}
          loading={loading}
        />
      </div>

      {}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="enrollments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(enrollmentData?.completionRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  of enrolled students complete courses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Drop-off Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {(enrollmentData?.dropOffRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  students who don't complete
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time to Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrollmentData?.avgCompletionDays || 0} days
                </div>
                <p className="text-xs text-muted-foreground">
                  average course completion time
                </p>
              </CardContent>
            </Card>
          </div>
          <ChartWrapper
            title="Enrollment Trends"
            description="Enrollments and completions over time"
            type="area"
            data={enrollmentData?.trend || []}
            config={enrollmentChartConfig}
            dataKeys={["enrollments", "completions"]}
            xAxisKey="date"
            loading={loading}
            height={350}
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(paymentData?.successRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  of payment attempts succeed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {(paymentData?.refundRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  of purchases refunded
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(paymentData?.avgOrderValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  average transaction amount
                </p>
              </CardContent>
            </Card>
          </div>
          <ChartWrapper
            title="Revenue Trends"
            description="Revenue and refunds over time"
            type="bar"
            data={paymentData?.trend || []}
            config={paymentChartConfig}
            dataKeys={["revenue", "refunds"]}
            xAxisKey="date"
            loading={loading}
            height={350}
          />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(userData?.totalUsers || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  registered users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(userData?.retentionRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  users return within 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userData?.avgSessionMinutes || 0} min
                </div>
                <p className="text-xs text-muted-foreground">
                  average time on platform
                </p>
              </CardContent>
            </Card>
          </div>
          <ChartWrapper
            title="User Activity"
            description="New and active users over time"
            type="line"
            data={userData?.trend || []}
            config={userChartConfig}
            dataKeys={["newUsers", "activeUsers"]}
            xAxisKey="date"
            loading={loading}
            height={350}
          />
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courseData?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  courses on platform
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(courseData?.avgRating || 0).toFixed(1)} ⭐
                </div>
                <p className="text-xs text-muted-foreground">
                  average course rating
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue per Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(courseData?.avgRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  average revenue per course
                </p>
              </CardContent>
            </Card>
          </div>
          <ChartWrapper
            title="Course Status"
            description="Published vs pending courses over time"
            type="bar"
            data={courseData?.trend || []}
            config={courseChartConfig}
            dataKeys={["published", "pending"]}
            xAxisKey="date"
            loading={loading}
            height={350}
          />
          
          {/* Top Courses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>
                Courses ranked by enrollments and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={topCoursesColumns}
                data={courseData?.topCourses || []}
                loading={loading}
                searchKey="title"
                searchPlaceholder="Search courses..."
                pageSize={5}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
