import { useState, useEffect, useCallback } from "react";
import getUserDataOnClient from "@/lib/apiCalls/auth/getUserDataOnClient.apiCall";
import { toast } from "sonner";

/**
 * Custom hook for settings page data management
 * @returns {Object} User data, profile data, and handlers
 */
export function useSettings() {
  const [loading, setLoading] = useState(true);
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

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserDataOnClient();
      
      // Handle failed response
      if (!response?.success && !response?.data) {
        console.error("Failed to fetch user data:", response);
        setLoading(false);
        return;
      }
      
      const user = response?.data;
      
      if (user) {
        setUserData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          is_email_verified: user.is_email_verified || false,
        });
        
        setProfileData({
          bio: user?.Profile?.bio || "",
          headline: user?.Profile?.headline || "",
          avatar_url: user?.Profile?.avatar_url || "",
          username: user?.Profile?.username || user?.email?.split("@")[0] || "",
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
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleUserChange = useCallback((field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleProfileChange = useCallback((field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSocialLinkChange = useCallback((platform, value) => {
    setProfileData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  }, []);

  const updateAvatar = useCallback((avatarUrl) => {
    setProfileData((prev) => ({ ...prev, avatar_url: avatarUrl }));
  }, []);

  return {
    loading,
    userData,
    profileData,
    handleUserChange,
    handleProfileChange,
    handleSocialLinkChange,
    updateAvatar,
    refetch: fetchUserData,
  };
}
