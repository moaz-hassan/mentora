"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  MessageSquare,
  Download,
  User,
  GraduationCap,
  UserCheck,
  FileText,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AnalyticsCard,
  DataTable,
  FilterBar,
} from "@/components/admin/shared";
import { 
  getReports, 
  getReportsStats, 
  updateReportStatus, 
  addReportNotes, 
  resolveReport 
} from "@/lib/apiCalls/admin/reports.apiCall";

export default function ReportsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    reporterType: "all",
    status: "all",
    priority: "all",
  });

  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [internalNote, setInternalNote] = useState("");
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const filterParams = {};
      if (filters.reporterType !== "all") filterParams.type = filters.reporterType;
      if (filters.status !== "all") filterParams.status = filters.status;
      if (filters.priority !== "all") filterParams.priority = filters.priority;

      const [reportsResult, statsResult] = await Promise.all([
        getReports(filterParams),
        getReportsStats(),
      ]);

      if (reportsResult.success) {
        setReports(reportsResult.reports || reportsResult.data?.reports || []);
      } else {
        toast.error(reportsResult.error || "Failed to load reports");
        setReports([]);
      }

      if (statsResult.success) {
        setStats(statsResult.stats || statsResult.data?.stats || null);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("Reports refreshed");
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setInternalNote("");
    setResolutionDetails("");
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReport) return;

    setUpdating(true);
    try {
      const result = await updateReportStatus(selectedReport.id, newStatus);
      if (result.success) {
        toast.success(result.message || "Status updated");
        fetchData();
        setSelectedReport({ ...selectedReport, status: newStatus });
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedReport || !internalNote.trim()) return;

    setUpdating(true);
    try {
      const result = await addReportNotes(selectedReport.id, internalNote);
      if (result.success) {
        toast.success(result.message || "Note added");
        setInternalNote("");
        fetchData();
      } else {
        toast.error(result.error || "Failed to add note");
      }
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedReport || !resolutionDetails.trim()) {
      toast.error("Please provide resolution details");
      return;
    }

    setUpdating(true);
    try {
      const result = await resolveReport(selectedReport.id, resolutionDetails);
      if (result.success) {
        toast.success(result.message || "Report resolved");
        setDetailDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Failed to resolve report");
      }
    } catch (error) {
      toast.error("Failed to resolve report");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-4 w-4 text-yellow-500" />,
      "in-review": <AlertCircle className="h-4 w-4 text-blue-500" />,
      resolved: <CheckCircle className="h-4 w-4 text-green-500" />,
      dismissed: <XCircle className="h-4 w-4 text-gray-500" />,
    };
    return icons[status] || icons.pending;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return (
      <Badge variant={variants[priority] || "secondary"}>
        {priority || "normal"}
      </Badge>
    );
  };

  const getReporterBadge = (reporterType) => {
    if (reporterType === "instructor") {
      return (
        <Badge variant="outline" className="gap-1">
          <UserCheck className="h-3 w-3" />
          Instructor
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <GraduationCap className="h-3 w-3" />
        Student
      </Badge>
    );
  };

  
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "reporter",
      header: "Reporter",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">
            {row.original.Reporter?.first_name} {row.original.Reporter?.last_name}
          </div>
          {getReporterBadge(row.original.reporter_type)}
        </div>
      ),
    },
    {
      accessorKey: "content_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.content_type}</Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => getPriorityBadge(row.original.priority || row.original.ai_severity),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <span className="capitalize">{row.original.status}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) =>
        row.original.createdAt
          ? format(new Date(row.original.createdAt), "MMM d, yyyy")
          : "-",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleViewDetails(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Report Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage user-submitted reports
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
          title="Total Reports"
          value={stats?.total || 0}
          icon={FileText}
          loading={loading}
        />
        <AnalyticsCard
          title="Pending"
          value={stats?.pending || 0}
          icon={Clock}
          loading={loading}
        />
        <AnalyticsCard
          title="Critical"
          value={stats?.critical || 0}
          icon={AlertCircle}
          loading={loading}
        />
        <AnalyticsCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon={CheckCircle}
          loading={loading}
        />
      </div>

      {}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <Label>Reporter Type</Label>
              <Select
                value={filters.reporterType}
                onValueChange={(v) => setFilters({ ...filters, reporterType: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="instructor">Instructors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select
                value={filters.priority}
                onValueChange={(v) => setFilters({ ...filters, priority: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            {reports.length} reports found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reports}
            loading={loading}
            searchKey="title"
            searchPlaceholder="Search reports..."
            pageSize={10}
          />
        </CardContent>
      </Card>

      {}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Report #{selectedReport?.id}
              {selectedReport && getReporterBadge(selectedReport.reporter_type)}
            </DialogTitle>
            <DialogDescription>
              Submitted on{" "}
              {selectedReport?.createdAt &&
                format(new Date(selectedReport.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                <TabsTrigger value="resolve">Resolve</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-semibold">{selectedReport.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="whitespace-pre-wrap">{selectedReport.description}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Reporter</Label>
                    <p>
                      {selectedReport.Reporter?.first_name}{" "}
                      {selectedReport.Reporter?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedReport.Reporter?.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Content Type</Label>
                    <p>{selectedReport.content_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedReport.priority || selectedReport.ai_severity)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedReport.status)}
                      <span className="capitalize">{selectedReport.status}</span>
                    </div>
                  </div>
                </div>

                {}
                {selectedReport.attachments?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Attachments</Label>
                      <div className="mt-2 space-y-2">
                        {selectedReport.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded border"
                          >
                            <span className="text-sm">{attachment.name}</span>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div>
                  <Label className="text-muted-foreground mb-2 block">
                    Update Status
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus("in-review")}
                      disabled={updating || selectedReport.status === "in-review"}
                    >
                      Mark In Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus("resolved")}
                      disabled={updating || selectedReport.status === "resolved"}
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus("dismissed")}
                      disabled={updating || selectedReport.status === "dismissed"}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div>
                  <Label>Add Internal Note</Label>
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add a note for internal reference..."
                    rows={3}
                    className="mt-2"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={updating || !internalNote.trim()}
                    className="mt-2"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Previous Notes</Label>
                  {selectedReport.internal_notes?.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedReport.internal_notes.map((note, index) => (
                        <div key={index} className="p-3 rounded bg-muted">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {note.author} - {format(new Date(note.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      No internal notes yet
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="resolve" className="space-y-4">
                <div>
                  <Label>Resolution Details</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Provide details about how this report was resolved. The reporter
                    will be notified.
                  </p>
                  <Textarea
                    value={resolutionDetails}
                    onChange={(e) => setResolutionDetails(e.target.value)}
                    placeholder="Describe the resolution..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleResolve}
                  disabled={updating || !resolutionDetails.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Resolve & Notify Reporter
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
