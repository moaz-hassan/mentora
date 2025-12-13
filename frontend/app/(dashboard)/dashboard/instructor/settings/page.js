"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/lib/apiCalls/cloudinary/uploadImageToCloudinary";
import {
  SettingsHeader,
  SettingsTabs,
  ProfileTab,
  SocialLinksTab,
  SecurityTab,
} from "@/components/instructor/settings";
import updateProfile from "@/lib/apiCalls/profile/updateUserProfile.apiCall";
import {
  validateProfileUpdate,
  sanitizeProfileData,
} from "@/lib/validation/profileValidation";
import { useSettings } from "@/hooks/profile/useSettings";
import { useProfileSettings } from "@/hooks/profile";

export default function InstructorSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const {
    loading,
    userData,
    profileData,
    handleUserChange,
    handleProfileChange,
    handleSocialLinkChange,
    updateAvatar,
  } = useSettings();
  
  const { isSaving, updateProfile: saveProfile } = useProfileSettings();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Uploading avatar...");

    try {
      const result = await uploadImageToCloudinary(file, (progressData) => {
        // Sonner doesn't support updating toast content, so we just let the loading toast show
      });

      if (result.secure_url) {
        updateAvatar(result.secure_url);
        
        toast.dismiss(loadingToast);
        toast.loading("Saving to database...");

        await saveProfile({ avatar_url: result.secure_url });

        toast.dismiss();
        toast.success("Avatar updated successfully!");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.dismiss();
      toast.error("Failed to upload avatar: " + error.message);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const combinedData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        bio: profileData.bio,
        headline: profileData.headline,
        avatar_url: profileData.avatar_url,
        social_links: profileData.social_links,
      };

      const validation = validateProfileUpdate(combinedData);

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        if (typeof firstError === "object") {
          const firstSocialError = Object.values(firstError)[0];
          toast.error(firstSocialError);
        } else {
          toast.error(firstError);
        }
        return;
      }

      const updateData = sanitizeProfileData(combinedData);

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        return;
      }

      await saveProfile(updateData);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SettingsHeader />
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "profile" && (
        <ProfileTab
          userData={userData}
          profileData={profileData}
          saving={isSaving}
          onUserChange={handleUserChange}
          onProfileChange={handleProfileChange}
          onAvatarUpload={handleAvatarUpload}
          onSave={handleSaveProfile}
        />
      )}

      {activeTab === "social" && (
        <SocialLinksTab
          socialLinks={profileData.social_links}
          saving={isSaving}
          onSocialLinkChange={handleSocialLinkChange}
          onSave={handleSaveProfile}
        />
      )}

      {activeTab === "security" && (
        <SecurityTab user={userData} />
      )}
    </div>
  );
}
