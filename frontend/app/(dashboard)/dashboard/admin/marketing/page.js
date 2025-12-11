"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Star,
  Eye,
  TrendingUp,
  MousePointer,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AnalyticsCard,
  DataTable,
} from "@/components/admin/shared";
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getFeaturedCourses,
  addFeaturedCourse,
  removeFeaturedCourse,
} from "@/lib/apiCalls/admin/marketing.apiCall";

export default function MarketingToolsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);

  
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [featuredDialogOpen, setFeaturedDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [featuredForm, setFeaturedForm] = useState({
    courseId: "",
    position: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [campaignsRes, featuredRes] = await Promise.all([
        getCampaigns(),
        getFeaturedCourses(),
      ]);

      if (campaignsRes.success) setCampaigns(campaignsRes.data?.campaigns || []);
      if (featuredRes.success) setFeaturedCourses(featuredRes.data?.courses || []);
    } catch (error) {
      console.error("Error fetching marketing data:", error);
      toast.error("Failed to load marketing data");
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

  const handleSaveCampaign = async () => {
    if (!campaignForm.name || !campaignForm.startDate || !campaignForm.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && selectedItem) {
        await updateCampaign(selectedItem.id, campaignForm);
        toast.success("Campaign updated successfully");
      } else {
        await createCampaign(campaignForm);
        toast.success("Campaign created successfully");
      }
      setCampaignDialogOpen(false);
      resetCampaignForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedItem) return;

    setSaving(true);
    try {
      await deleteCampaign(selectedItem.id);
      toast.success("Campaign deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to delete campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeatured = async () => {
    if (!featuredForm.courseId) {
      toast.error("Please enter a course ID");
      return;
    }

    setSaving(true);
    try {
      await addFeaturedCourse({
        courseId: parseInt(featuredForm.courseId),
        position: featuredForm.position ? parseInt(featuredForm.position) : null,
      });
      toast.success("Featured course added");
      setFeaturedDialogOpen(false);
      setFeaturedForm({ courseId: "", position: "" });
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to add featured course");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFeatured = async (id) => {
    try {
      await removeFeaturedCourse(id);
      toast.success("Featured course removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove featured course");
    }
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setIsEditing(false);
    setSelectedItem(null);
  };

  const openEditCampaign = (campaign) => {
    setSelectedItem(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || "",
      startDate: campaign.startDate?.split("T")[0] || "",
      endDate: campaign.endDate?.split("T")[0] || "",
      isActive: campaign.isActive,
    });
    setIsEditing(true);
    setCampaignDialogOpen(true);
  };

  const openDeleteDialog = (campaign) => {
    setSelectedItem(campaign);
    setDeleteDialogOpen(true);
  };

  
  const activeCampaigns = campaigns.filter((c) => c.isActive).length;
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);

  
  const campaignColumns = [
    {
      accessorKey: "name",
      header: "Campaign",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.startDate), "MMM d")} -{" "}
          {format(new Date(row.original.endDate), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          {(row.original.impressions || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <MousePointer className="h-4 w-4 text-muted-foreground" />
          {(row.original.clicks || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
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
            onClick={() => openEditCampaign(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDeleteDialog(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  
  const featuredColumns = [
    {
      accessorKey: "position",
      header: "#",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.position || "-"}</Badge>
      ),
    },
    {
      accessorKey: "title",
      header: "Course",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "instructor",
      header: "Instructor",
    },
    {
      accessorKey: "addedAt",
      header: "Added",
      cell: ({ row }) =>
        row.original.addedAt
          ? format(new Date(row.original.addedAt), "MMM d, yyyy")
          : "-",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveFeatured(row.original.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketing Tools</h1>
          <p className="text-muted-foreground mt-1">
            Manage campaigns and featured content
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
          title="Active Campaigns"
          value={activeCampaigns}
          icon={Megaphone}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Impressions"
          value={totalImpressions}
          icon={Eye}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Clicks"
          value={totalClicks}
          icon={MousePointer}
          loading={loading}
        />
        <AnalyticsCard
          title="Conversions"
          value={totalConversions}
          icon={ShoppingCart}
          loading={loading}
        />
      </div>

      {}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="featured">Featured Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Marketing Campaigns</CardTitle>
                <CardDescription>
                  Create and manage promotional campaigns
                </CardDescription>
              </div>
              <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetCampaignForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditing ? "Edit Campaign" : "Create Campaign"}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditing
                        ? "Update campaign details"
                        : "Create a new marketing campaign"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Campaign Name</Label>
                      <Input
                        id="name"
                        value={campaignForm.name}
                        onChange={(e) =>
                          setCampaignForm({ ...campaignForm, name: e.target.value })
                        }
                        placeholder="Summer Sale 2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={campaignForm.description}
                        onChange={(e) =>
                          setCampaignForm({ ...campaignForm, description: e.target.value })
                        }
                        placeholder="Campaign description..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={campaignForm.startDate}
                          onChange={(e) =>
                            setCampaignForm({ ...campaignForm, startDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={campaignForm.endDate}
                          onChange={(e) =>
                            setCampaignForm({ ...campaignForm, endDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isActive">Active</Label>
                      <Switch
                        id="isActive"
                        checked={campaignForm.isActive}
                        onCheckedChange={(checked) =>
                          setCampaignForm({ ...campaignForm, isActive: checked })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCampaignDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCampaign} disabled={saving}>
                      {saving ? "Saving..." : isEditing ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={campaignColumns}
                data={campaigns}
                loading={loading}
                searchKey="name"
                searchPlaceholder="Search campaigns..."
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Featured Courses</CardTitle>
                <CardDescription>
                  Manage courses displayed on the homepage
                </CardDescription>
              </div>
              <Dialog open={featuredDialogOpen} onOpenChange={setFeaturedDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Featured
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Featured Course</DialogTitle>
                    <DialogDescription>
                      Select a course to feature on the homepage
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseId">Course ID</Label>
                      <Input
                        id="courseId"
                        type="number"
                        value={featuredForm.courseId}
                        onChange={(e) =>
                          setFeaturedForm({ ...featuredForm, courseId: e.target.value })
                        }
                        placeholder="Enter course ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position (Optional)</Label>
                      <Input
                        id="position"
                        type="number"
                        value={featuredForm.position}
                        onChange={(e) =>
                          setFeaturedForm({ ...featuredForm, position: e.target.value })
                        }
                        placeholder="Display order"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setFeaturedDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddFeatured} disabled={saving}>
                      {saving ? "Adding..." : "Add Course"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={featuredColumns}
                data={featuredCourses}
                loading={loading}
                searchKey="title"
                searchPlaceholder="Search courses..."
                pageSize={10}
                emptyMessage="No featured courses"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
