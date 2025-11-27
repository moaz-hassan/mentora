"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Bell,
  Send,
  Clock,
  Users,
  UserCheck,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AnalyticsCard,
  DataTable,
  FilterBar,
} from "@/components/admin/shared";
import * as notificationsAPI from "@/lib/apiCalls/admin/notifications.apiCall";

// History table columns
const historyColumns = [
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
    accessorKey: "targetAudience",
    header: "Audience",
    cell: ({ row }) => {
      const audience = row.original.targetAudience;
      const icons = {
        all: <Users className="h-4 w-4" />,
        students: <GraduationCap className="h-4 w-4" />,
        instructors: <UserCheck className="h-4 w-4" />,
      };
      return (
        <div className="flex items-center gap-2">
          {icons[audience]}
          <span className="capitalize">{audience}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "recipientCount",
    header: "Recipients",
    cell: ({ row }) => row.original.recipientCount?.toLocaleString() || "0",
  },
  {
    accessorKey: "deliveryStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.deliveryStatus;
      const variants = {
        delivered: "default",
        pending: "secondary",
        failed: "destructive",
        scheduled: "outline",
      };
      return (
        <Badge variant={variants[status] || "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Sent At",
    cell: ({ row }) =>
      row.original.createdAt
        ? format(new Date(row.original.createdAt), "MMM d, yyyy HH:mm")
        : "-",
  },
];

// Scheduled table columns
const scheduledColumns = [
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
    accessorKey: "targetAudience",
    header: "Audience",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.targetAudience}</span>
    ),
  },
  {
    accessorKey: "scheduledFor",
    header: "Scheduled For",
    cell: ({ row }) =>
      row.original.scheduledFor
        ? format(new Date(row.original.scheduledFor), "MMM d, yyyy HH:mm")
        : "-",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => row.original.onSend?.(row.original.id)}
        >
          <Send className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => row.original.onCancel?.(row.original.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];

export default function NotificationManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Data states
  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);
  const [scheduled, setScheduled] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "all",
    scheduledFor: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, historyRes, scheduledRes] = await Promise.all([
        notificationsAPI.getStatistics().catch(err => ({ success: false, error: err.message })),
        notificationsAPI.getHistory({ limit: 50 }).catch(err => ({ success: false, error: err.message })),
        notificationsAPI.getScheduled().catch(err => ({ success: false, error: err.message })),
      ]);

      if (statsRes.success) setStatistics(statsRes.data);
      if (historyRes.success) setHistory(historyRes.data?.notifications || []);
      if (scheduledRes.success) setScheduled(scheduledRes.data?.notifications || []);
      
      // Only show error if all requests failed
      if (!statsRes.success && !historyRes.success && !scheduledRes.success) {
        toast.error("Failed to load notifications data");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("Data refreshed");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateAI = async () => {
    if (!formData.targetAudience) {
      toast.error("Please select a target audience first");
      return;
    }

    setGeneratingAI(true);
    try {
      // Simulate AI generation - in real app, call AI endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const suggestions = {
        all: {
          title: "🎉 Exciting Updates Coming Your Way!",
          message: "We've been working hard to bring you new features and improvements. Stay tuned for upcoming course releases, enhanced learning tools, and exclusive offers. Thank you for being part of our learning community!",
        },
        students: {
          title: "📚 New Courses Just for You!",
          message: "Based on your learning interests, we've curated a selection of new courses that might interest you. Check out our latest additions and continue your learning journey with us!",
        },
        instructors: {
          title: "💡 Instructor Tips & Updates",
          message: "We've added new tools to help you create better courses. Check out our updated analytics dashboard, new content creation features, and tips for engaging your students more effectively.",
        },
      };

      const suggestion = suggestions[formData.targetAudience];
      setFormData((prev) => ({
        ...prev,
        title: suggestion.title,
        message: suggestion.message,
      }));
      toast.success("AI content generated");
    } catch (error) {
      toast.error("Failed to generate content");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        targetAudience: formData.targetAudience,
        ...(formData.scheduledFor && { scheduledFor: formData.scheduledFor }),
      };

      const res = await notificationsAPI.broadcast(payload);
      
      if (res.success) {
        toast.success(
          formData.scheduledFor
            ? "Notification scheduled successfully"
            : "Notification sent successfully"
        );
        setCreateDialogOpen(false);
        setFormData({
          title: "",
          message: "",
          targetAudience: "all",
          scheduledFor: "",
        });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const handleSendScheduled = async (id) => {
    try {
      await notificationsAPI.sendScheduled(id);
      toast.success("Notification sent");
      fetchData();
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const handleCancelScheduled = async (id) => {
    try {
      await notificationsAPI.cancelScheduled(id);
      toast.success("Notification cancelled");
      fetchData();
    } catch (error) {
      toast.error("Failed to cancel notification");
    }
  };

  // Add action handlers to scheduled data
  const scheduledWithActions = scheduled.map((item) => ({
    ...item,
    onSend: handleSendScheduled,
    onCancel: handleCancelScheduled,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground mt-1">
            Send and manage platform notifications
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
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to your platform users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(v) => handleInputChange("targetAudience", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          All Users
                        </div>
                      </SelectItem>
                      <SelectItem value="students">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Students Only
                        </div>
                      </SelectItem>
                      <SelectItem value="instructors">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Instructors Only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">Title</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateAI}
                      disabled={generatingAI}
                    >
                      <Sparkles className={`h-4 w-4 mr-1 ${generatingAI ? "animate-pulse" : ""}`} />
                      {generatingAI ? "Generating..." : "AI Generate"}
                    </Button>
                  </div>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your notification message..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Schedule (Optional)</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to send immediately
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewDialogOpen(true)}
                  disabled={!formData.title || !formData.message}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSendNotification} disabled={sending}>
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {formData.scheduledFor ? "Schedule" : "Send Now"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Sent"
          value={statistics?.totalSent || 0}
          icon={Send}
          loading={loading}
        />
        <AnalyticsCard
          title="Delivered"
          value={statistics?.delivered || 0}
          change={statistics?.deliveryRate}
          changeLabel="delivery rate"
          icon={Bell}
          loading={loading}
        />
        <AnalyticsCard
          title="Scheduled"
          value={statistics?.scheduled || 0}
          icon={Clock}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Recipients"
          value={statistics?.totalRecipients || 0}
          icon={Users}
          loading={loading}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled
            {scheduled.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {scheduled.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                All sent notifications and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={historyColumns}
                data={history}
                loading={loading}
                searchKey="title"
                searchPlaceholder="Search notifications..."
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Notifications</CardTitle>
              <CardDescription>
                Notifications waiting to be sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={scheduledColumns}
                data={scheduledWithActions}
                loading={loading}
                emptyMessage="No scheduled notifications"
                showSearch={false}
                showPagination={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-semibold">{formData.title || "No title"}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.message || "No message"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Users className="h-3 w-3" />
              <span className="capitalize">{formData.targetAudience}</span>
              {formData.scheduledFor && (
                <>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(formData.scheduledFor), "MMM d, yyyy HH:mm")}
                  </span>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
