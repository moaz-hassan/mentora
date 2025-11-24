"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { uploadImageToCloudinary } from "@/lib/services/cloudinary.service";
import {
  SettingsHeader,
  SettingsTabs,
  ProfileTab,
  SocialLinksTab,
  SecurityTab,
} from "@/components/instructorDashboard/settings";
import getUserDataOnClient from "@/lib/apiCalls/auth/getUserDataOnClient.apiCall";
import updateProfile from "@/lib/apiCalls/profile/updateUserProfile.apiCall";
import {
  validateProfileUpdate,
  sanitizeProfileData,
} from "@/lib/validation/profileValidation";

export default function InstructorSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [profileData, setProfileData] = useState({
    bio: "",
    headline: "",
    avatar_url: "",
    social_links: {
      twitter: "",
      linkedin: "",
      github: "",
      website: "",
      facebook: "",
      instagram: "",
      youtube: "",
    },
  });

  useEffect(() => {
    async function fetchUserData() {
      const userData = await getUserDataOnClient();
      const user = userData?.data;
      setUserData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
      setProfileData({
        bio: user?.Profile?.bio || "",
        headline: user?.Profile?.headline || "",
        avatar_url: user?.Profile?.avatar_url || "",
        social_links: user?.Profile?.social_links || {
          twitter: "",
          linkedin: "",
          github: "",
          website: "",
          facebook: "",
          instagram: "",
          youtube: "",
        },
      });
    }
    fetchUserData();
  }, []);

  const handleUserChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setProfileData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    let uploadToastId = null;

    try {
      setSaving(true);

      // Upload to Cloudinary with progress tracking
      const result = await uploadImageToCloudinary(file, (progressData) => {
        if (uploadToastId) {
          // Update existing toast
          toast.update(uploadToastId, {
            render: progressData.message,
            type: progressData.progress === 100 ? "success" : "info",
            autoClose: progressData.progress === 100 ? 2000 : false,
          });
        } else {
          // Create new toast
          uploadToastId = toast.info(progressData.message, {
            autoClose: false,
            closeButton: false,
          });
        }
      });

      if (result.secure_url) {
        // Update local state
        setProfileData((prev) => ({ ...prev, avatar_url: result.secure_url }));

        // Show saving toast
        if (uploadToastId) {
          toast.update(uploadToastId, {
            render: "Saving to database...",
            type: "info",
          });
        }

        // Save to database immediately
        const response = await updateProfile({
          avatar_url: result.secure_url,
        });

        if (response.success) {
          if (uploadToastId) {
            toast.update(uploadToastId, {
              render: "Avatar updated successfully!",
              type: "success",
              autoClose: 3000,
            });
          } else {
            toast.success("Avatar updated successfully!");
          }
        } else {
          throw new Error(response.message || "Failed to save avatar");
        }
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      if (uploadToastId) {
        toast.update(uploadToastId, {
          render: "Failed to upload avatar: " + error.message,
          type: "error",
          autoClose: 5000,
        });
      } else {
        toast.error("Failed to upload avatar: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      // Combine user and profile data
      const combinedData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        bio: profileData.bio,
        headline: profileData.headline,
        avatar_url: profileData.avatar_url,
        social_links: profileData.social_links,
      };

      // Validate the data
      const validation = validateProfileUpdate(combinedData);

      if (!validation.isValid) {
        // Show first validation error
        const firstError = Object.values(validation.errors)[0];
        if (typeof firstError === "object") {
          // Social links errors
          const firstSocialError = Object.values(firstError)[0];
          toast.error(firstSocialError);
        } else {
          toast.error(firstError);
        }
        return;
      }

      // Sanitize and prepare update data
      const updateData = sanitizeProfileData(combinedData);

      // Check if any updates were made
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        return;
      }

      // Send update request
      const response = await updateProfile(updateData);

      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <SettingsHeader />

      {/* Tabs */}
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <ProfileTab
          userData={userData}
          profileData={profileData}
          saving={saving}
          onUserChange={handleUserChange}
          onProfileChange={handleProfileChange}
          onAvatarUpload={handleAvatarUpload}
          onSave={handleSaveProfile}
        />
      )}

      {/* Social Links Tab */}
      {activeTab === "social" && (
        <SocialLinksTab
          socialLinks={profileData.social_links}
          saving={saving}
          onSocialLinkChange={handleSocialLinkChange}
          onSave={handleSaveProfile}
        />
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <SecurityTab user={userData} saving={saving} setSaving={setSaving} />
      )}
    </div>
  );
}
