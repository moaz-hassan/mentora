"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Percent,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  getAllCoupons,
  getCouponAnalytics,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
} from "@/lib/apiCalls/admin/coupons.apiCall";


const CouponForm = ({ formData, setFormData, formErrors }) => (
  <div className="space-y-4 py-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="code">Coupon Code</Label>
        <Input
          id="code"
          placeholder="e.g., SUMMER20"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        />
        {formErrors.code && (
          <p className="text-sm text-destructive">{formErrors.code}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="discountType">Discount Type</Label>
        <Select
          value={formData.discountType}
          onValueChange={(v) => setFormData({ ...formData, discountType: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="discountValue">
          Discount Value {formData.discountType === "percentage" ? "(%)" : "($)"}
        </Label>
        <Input
          id="discountValue"
          type="number"
          placeholder={formData.discountType === "percentage" ? "1-100" : "Amount"}
          value={formData.discountValue}
          onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
        />
        {formErrors.discountValue && (
          <p className="text-sm text-destructive">{formErrors.discountValue}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
        <Input
          id="usageLimit"
          type="number"
          placeholder="Unlimited"
          value={formData.usageLimit}
          onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />
        {formErrors.startDate && (
          <p className="text-sm text-destructive">{formErrors.startDate}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input
          id="endDate"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />
        {formErrors.endDate && (
          <p className="text-sm text-destructive">{formErrors.endDate}</p>
        )}
      </div>
    </div>
  </div>
);

export default function CouponManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [couponsRes, analyticsRes] = await Promise.all([
        getAllCoupons(),
        getCouponAnalytics(),
      ]);

      if (couponsRes.success) setCoupons(couponsRes.data?.coupons || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
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
    toast.success("Coupons refreshed");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.code.trim()) {
      errors.code = "Coupon code is required";
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    }

    if (formData.discountType === "percentage") {
      const value = parseFloat(formData.discountValue);
      if (value < 1 || value > 100) {
        errors.discountValue = "Percentage must be between 1 and 100";
      }
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discountType,
        discount_value: parseFloat(formData.discountValue),
        discount_start_date: formData.startDate,
        discount_end_date: formData.endDate,
        max_count: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        
      };

      const res = await createCoupon(payload);
      if (res.success) {
        toast.success("Coupon created successfully");
        setCreateDialogOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        coupon_id: selectedCoupon.id,
        discount_type: formData.discountType,
        discount_value: parseFloat(formData.discountValue),
        discount_start_date: formData.startDate,
        discount_end_date: formData.endDate,
        max_count: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        is_active: selectedCoupon.is_active,
      };

      const res = await updateCoupon(selectedCoupon.id, payload);
      if (res.success) {
        toast.success("Coupon updated successfully");
        setEditDialogOpen(false);
        setSelectedCoupon(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = coupon.status === "active" ? "inactive" : "active";
      const res = await updateCouponStatus(coupon.id, newStatus);
      if (res.success) {
        toast.success(`Coupon ${newStatus === "active" ? "activated" : "deactivated"}`);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update coupon status");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
    });
    setFormErrors({});
  };

  const openEditDialog = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      startDate: coupon.startDate?.split("T")[0] || "",
      endDate: coupon.endDate?.split("T")[0] || "",
      usageLimit: coupon.usageLimit?.toString() || "",
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const filteredCoupons = statusFilter === "all"
    ? coupons
    : coupons.filter((c) => c.status === statusFilter);

  
  const columns = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
          {row.original.code}
        </code>
      ),
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.discountType === "percentage" ? (
            <>
              <Percent className="h-4 w-4 text-muted-foreground" />
              {row.original.discountValue}%
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              {row.original.discountValue}
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "usage",
      header: "Usage",
      cell: ({ row }) => (
        <span>
          {row.original.usageCount || 0}
          {row.original.usageLimit && ` / ${row.original.usageLimit}`}
        </span>
      ),
    },
    {
      accessorKey: "validity",
      header: "Validity",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{format(new Date(row.original.startDate), "MMM d, yyyy")}</div>
          <div className="text-muted-foreground">
            to {format(new Date(row.original.endDate), "MMM d, yyyy")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const isExpired = new Date(row.original.endDate) < new Date();
        return (
          <Badge
            variant={
              isExpired ? "destructive" : status === "active" ? "default" : "secondary"
            }
          >
            {isExpired ? "Expired" : status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleStatus(row.original)}
            title={row.original.status === "active" ? "Deactivate" : "Activate"}
          >
            {row.original.status === "active" ? (
              <ToggleRight className="h-4 w-4 text-green-500" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditDialog(row.original)}
          >
            <Pencil className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage discount coupons
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
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
                <DialogDescription>
                  Create a new discount coupon for your courses
                </DialogDescription>
              </DialogHeader>
              <CouponForm 
                formData={formData} 
                setFormData={setFormData} 
                formErrors={formErrors} 
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating..." : "Create Coupon"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Coupons"
          value={analytics?.totalCoupons || 0}
          icon={Ticket}
          loading={loading}
        />
        <AnalyticsCard
          title="Active Coupons"
          value={analytics?.activeCoupons || 0}
          icon={ToggleRight}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Usage"
          value={analytics?.totalUsage || 0}
          icon={Percent}
          loading={loading}
        />
        <AnalyticsCard
          title="Revenue Impact"
          value={analytics?.revenueImpact || 0}
          format="currency"
          icon={DollarSign}
          loading={loading}
        />
      </div>

      {}
      <FilterBar
        showSearch={false}
        showDateRange={false}
        showStatus={true}
        statusOptions={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        onStatusChange={(status) => setStatusFilter(status || "all")}
      />

      {}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            {filteredCoupons.length} coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredCoupons}
            loading={loading}
            searchKey="code"
            searchPlaceholder="Search by code..."
            pageSize={10}
          />
        </CardContent>
      </Card>

      {}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update coupon details
            </DialogDescription>
          </DialogHeader>
          <CouponForm 
            formData={formData} 
            setFormData={setFormData} 
            formErrors={formErrors} 
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
