"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  BookOpen,
  Save,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsAPI } from "@/lib/api/admin";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      siteName: "",
      siteDescription: "",
      contactEmail: "",
      contactPhone: "",
      maintenanceMode: false,
    },
    email: {
      smtpHost: "",
      smtpPort: "",
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "",
      fromName: "",
    },
    payment: {
      currency: "USD",
      commissionRate: "20",
      payoutSchedule: "monthly",
      minimumPayout: "50",
      stripeEnabled: true,
      paypalEnabled: false,
    },
    course: {
      requireApproval: true,
      defaultPrice: "0",
      maxFileSize: "100",
      allowedFormats: "mp4,pdf,doc,docx",
      enableReviews: true,
      enableCertificates: true,
    },
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsAPI.getAll();
      if (res.success && res.data?.settings) {
        // Merge fetched settings with defaults
        const fetched = res.data.settings;
        setSettings((prev) => ({
          general: { ...prev.general, ...fetched.general },
          email: { ...prev.email, ...fetched.email },
          payment: { ...prev.payment, ...fetched.payment },
          course: { ...prev.course, ...fetched.course },
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await settingsAPI.bulkUpdate(settings);
      if (res.success) {
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    toast.info("Settings reset to saved values");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="course" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Course
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleChange("general", "siteName", e.target.value)}
                    placeholder="My Learning Platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleChange("general", "contactEmail", e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleChange("general", "siteDescription", e.target.value)}
                  placeholder="A brief description of your platform"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.general.contactPhone}
                  onChange={(e) => handleChange("general", "contactPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to show maintenance page to visitors
                  </p>
                </div>
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => handleChange("general", "maintenanceMode", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => handleChange("email", "smtpHost", e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleChange("email", "smtpPort", e.target.value)}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.email.smtpUser}
                    onChange={(e) => handleChange("email", "smtpUser", e.target.value)}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => handleChange("email", "smtpPassword", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleChange("email", "fromEmail", e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => handleChange("email", "fromName", e.target.value)}
                    placeholder="My Platform"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment and payout settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.payment.currency}
                    onValueChange={(v) => handleChange("payment", "currency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payment.commissionRate}
                    onChange={(e) => handleChange("payment", "commissionRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                  <Select
                    value={settings.payment.payoutSchedule}
                    onValueChange={(v) => handleChange("payment", "payoutSchedule", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumPayout">Minimum Payout ($)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    min="0"
                    value={settings.payment.minimumPayout}
                    onChange={(e) => handleChange("payment", "minimumPayout", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Stripe Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via Stripe
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.stripeEnabled}
                    onCheckedChange={(checked) => handleChange("payment", "stripeEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>PayPal Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via PayPal
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.paypalEnabled}
                    onCheckedChange={(checked) => handleChange("payment", "paypalEnabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Settings */}
        <TabsContent value="course">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Configure course creation and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultPrice">Default Price ($)</Label>
                  <Input
                    id="defaultPrice"
                    type="number"
                    min="0"
                    value={settings.course.defaultPrice}
                    onChange={(e) => handleChange("course", "defaultPrice", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    value={settings.course.maxFileSize}
                    onChange={(e) => handleChange("course", "maxFileSize", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFormats">Allowed File Formats</Label>
                <Input
                  id="allowedFormats"
                  value={settings.course.allowedFormats}
                  onChange={(e) => handleChange("course", "allowedFormats", e.target.value)}
                  placeholder="mp4,pdf,doc,docx"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of allowed file extensions
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Require Course Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      New courses must be approved before publishing
                    </p>
                  </div>
                  <Switch
                    checked={settings.course.requireApproval}
                    onCheckedChange={(checked) => handleChange("course", "requireApproval", checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Enable Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow students to review courses
                    </p>
                  </div>
                  <Switch
                    checked={settings.course.enableReviews}
                    onCheckedChange={(checked) => handleChange("course", "enableReviews", checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Enable Certificates</Label>
                    <p className="text-sm text-muted-foreground">
                      Issue certificates upon course completion
                    </p>
                  </div>
                  <Switch
                    checked={settings.course.enableCertificates}
                    onCheckedChange={(checked) => handleChange("course", "enableCertificates", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
