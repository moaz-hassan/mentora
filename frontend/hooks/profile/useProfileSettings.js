import { useState, useCallback } from "react";
import { updateUserProfile } from "@/lib/apiCalls/student/profile.apiCall";
import { changePassword } from "@/lib/apiCalls/student/profile.apiCall";
import { toast } from "sonner";


export function useProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setIsSaving(true);
      const response = await updateUserProfile(profileData);

      if (response.success) {
        toast.success("Profile updated successfully!");
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    try {
      setIsSaving(true);
      const response = await changePassword(currentPassword, newPassword, confirmPassword);

      if (response.success) {
        toast.success("Password changed successfully!");
        return true;
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    updateProfile,
    updatePassword,
  };
}
