"use client";

import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Lock, Bell, Save, Camera } from "lucide-react";

export default function StudentSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile settings
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    profile_picture_url: "",
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: true,
    course_updates: true,
    new_messages: true,
    certificates: true,
    marketing: false,
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        bio: user.bio || "",
        profile_picture_url: user.profile_picture_url || "",
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationPrefs((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profileData.first_name || !profileData.last_name || !profileData.email) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const { updateUserProfile } = await import("@/lib/apiCalls/student/profile.apiCall");
      const result = await updateUserProfile(profileData);
      
      if (result.success) {
        updateUser(result.data);
        alert("Profile updated successfully!");
      } else {
        alert(result.error || "Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);

    try {
      const { updateNotificationPreferences } = await import("@/lib/apiCalls/student/profile.apiCall");
      const result = await updateNotificationPreferences(notificationPrefs);
      
      if (result.success) {
        alert("Notification preferences updated successfully!");
      } else {
        alert(result.error || "Failed to update preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      alert("Failed to update preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const { changePassword } = await import("@/lib/apiCalls/student/profile.apiCall");
      const result = await changePassword(
        passwordData.current_password,
        passwordData.new_password,
        passwordData.confirm_password
      );
      
      if (result.success) {
        alert("Password changed successfully!");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        alert(result.error || "Failed to change password. Please try again.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert(error.message || "Failed to change password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {profileData.first_name?.charAt(0) || "U"}
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) =>
                    handleProfileChange("first_name", e.target.value)
                  }
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) =>
                    handleProfileChange("last_name", e.target.value)
                  }
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => handleProfileChange("email", e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleProfileChange("bio", e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Email Notifications
              </h3>
              <div className="space-y-4">
                <NotificationToggle
                  label="Email Notifications"
                  description="Receive email notifications for important updates"
                  checked={notificationPrefs.email_notifications}
                  onChange={(checked) =>
                    handleNotificationChange("email_notifications", checked)
                  }
                />
                <NotificationToggle
                  label="Course Updates"
                  description="Get notified when instructors post new content"
                  checked={notificationPrefs.course_updates}
                  onChange={(checked) =>
                    handleNotificationChange("course_updates", checked)
                  }
                />
                <NotificationToggle
                  label="New Messages"
                  description="Receive notifications for new chat messages"
                  checked={notificationPrefs.new_messages}
                  onChange={(checked) =>
                    handleNotificationChange("new_messages", checked)
                  }
                />
                <NotificationToggle
                  label="Certificates"
                  description="Get notified when you earn a certificate"
                  checked={notificationPrefs.certificates}
                  onChange={(checked) =>
                    handleNotificationChange("certificates", checked)
                  }
                />
                <NotificationToggle
                  label="Marketing Emails"
                  description="Receive promotional emails and special offers"
                  checked={notificationPrefs.marketing}
                  onChange={(checked) =>
                    handleNotificationChange("marketing", checked)
                  }
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      handlePasswordChange("current_password", e.target.value)
                    }
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      handlePasswordChange("new_password", e.target.value)
                    }
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      handlePasswordChange("confirm_password", e.target.value)
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleChangePassword}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                {saving ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}
