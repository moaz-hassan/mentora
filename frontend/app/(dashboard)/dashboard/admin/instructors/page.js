"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Users,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  DollarSign,
  BookOpen,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AnalyticsCard,
  DataTable,
  ChartWrapper,
} from "@/components/admin/shared";
import { instructorsAPI } from "@/lib/apiCalls/admin/instructors.apiCall";


const performanceChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  enrollments: { label: "Enrollments", color: "hsl(var(--chart-2))" },
};

export default function InstructorManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [instructors, setInstructors] = useState([]);
  
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [instructorDetails, setInstructorDetails] = useState(null);
  const [instructorAnalytics, setInstructorAnalytics] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchInstructors = useCallback(async () => {
    try {
      const res = await instructorsAPI.getAll();
      if (res.success) {
        setInstructors(res.data?.instructors || []);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast.error("Failed to load instructors");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInstructors();
    toast.success("Instructors refreshed");
  };

  const handleViewDetails = async (instructor) => {
    setSelectedInstructor(instructor);
    setDetailDialogOpen(true);
    setLoadingDetails(true);

    try {
      const [detailsRes, analyticsRes] = await Promise.all([
        instructorsAPI.getById(instructor.id),
        instructorsAPI.getAnalytics(instructor.id),
      ]);

      if (detailsRes.success) setInstructorDetails(detailsRes.data);
      if (analyticsRes.success) setInstructorAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error("Failed to load instructor details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedInstructor) return;

    setUpdatingStatus(true);
    try {
      const newStatus = selectedInstructor.status === "active" ? "suspended" : "active";
      const res = await instructorsAPI.updateStatus(selectedInstructor.id, newStatus);
      
      if (res.success) {
        toast.success(
          newStatus === "active"
            ? "Instructor activated successfully"
            : "Instructor suspended successfully"
        );
        setStatusDialogOpen(false);
        setSelectedInstructor(null);
        fetchInstructors();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update instructor status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusDialog = (instructor) => {
    setSelectedInstructor(instructor);
    setStatusDialogOpen(true);
  };

  
  const totalInstructors = instructors.length;
  const activeInstructors = instructors.filter((i) => i.status === "active").length;
  const totalRevenue = instructors.reduce((sum, i) => sum + (i.totalRevenue || 0), 0);
  const totalStudents = instructors.reduce((sum, i) => sum + (i.totalStudents || 0), 0);

  
  const columns = [
    {
      accessorKey: "name",
      header: "Instructor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback>
              {row.original.name?.charAt(0)?.toUpperCase() || "I"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "courseCount",
      header: "Courses",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          {row.original.courseCount || 0}
        </div>
      ),
    },
    {
      accessorKey: "totalStudents",
      header: "Students",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          {row.original.totalStudents?.toLocaleString() || 0}
        </div>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: "Revenue",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.original.totalRevenue || 0),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          {row.original.rating?.toFixed(1) || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "default" : "destructive"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openStatusDialog(row.original)}
          >
            {row.original.status === "active" ? (
              <UserX className="h-4 w-4 text-destructive" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-500" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Instructor Management</h1>
          <p className="text-muted-foreground mt-1">
            Oversee instructor accounts and performance
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Instructors"
          value={totalInstructors}
          icon={Users}
          loading={loading}
        />
        <AnalyticsCard
          title="Active Instructors"
          value={activeInstructors}
          icon={UserCheck}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={totalRevenue}
          format="currency"
          icon={DollarSign}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Students"
          value={totalStudents}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>All Instructors</CardTitle>
          <CardDescription>
            Manage instructor accounts and view performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={instructors}
            loading={loading}
            searchKey="name"
            searchPlaceholder="Search instructors..."
            pageSize={10}
          />
        </CardContent>
      </Card>

      {}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Instructor Details</DialogTitle>
            <DialogDescription>
              View instructor profile and performance metrics
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : instructorDetails ? (
            <Tabs defaultValue="profile" className="mt-4">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={instructorDetails.avatar} />
                    <AvatarFallback className="text-lg">
                      {instructorDetails.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{instructorDetails.name}</h3>
                    <p className="text-muted-foreground">{instructorDetails.email}</p>
                    <Badge
                      variant={instructorDetails.status === "active" ? "default" : "destructive"}
                      className="mt-1"
                    >
                      {instructorDetails.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {instructorDetails.createdAt
                        ? format(new Date(instructorDetails.createdAt), "MMM d, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(instructorDetails.totalEarnings || 0)}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                {instructorAnalytics && (
                  <ChartWrapper
                    title="Performance Trends"
                    type="line"
                    data={instructorAnalytics.trend || []}
                    config={performanceChartConfig}
                    dataKeys={["revenue", "enrollments"]}
                    xAxisKey="month"
                    height={250}
                  />
                )}
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-2">
                  {instructorDetails.courses?.length > 0 ? (
                    instructorDetails.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.enrollments} enrollments
                          </p>
                        </div>
                        <Badge variant="outline">{course.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No courses found
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedInstructor?.status === "active"
                ? "Suspend Instructor"
                : "Activate Instructor"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedInstructor?.status === "active"
                ? `Are you sure you want to suspend ${selectedInstructor?.name}? Their courses will be hidden from public view.`
                : `Are you sure you want to activate ${selectedInstructor?.name}? Their courses will become visible again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={updatingStatus}
              className={
                selectedInstructor?.status === "active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {updatingStatus
                ? "Updating..."
                : selectedInstructor?.status === "active"
                ? "Suspend"
                : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
