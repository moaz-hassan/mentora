import axios from "axios";
import { getAuthToken, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    
    return Promise.reject(error);
  }
);


export const getCampaigns = async () => {
  try {
    const response = await apiClient.get("/api/admin/marketing/campaigns");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch campaigns",
    };
  }
};


export const createCampaign = async (campaignData) => {
  try {
    const response = await apiClient.post("/api/admin/marketing/campaigns", campaignData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw new Error(error.response?.data?.message || "Failed to create campaign");
  }
};


export const updateCampaign = async (campaignId, campaignData) => {
  try {
    const response = await apiClient.put(`/api/admin/marketing/campaigns/${campaignId}`, campaignData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw new Error(error.response?.data?.message || "Failed to update campaign");
  }
};


export const deleteCampaign = async (campaignId) => {
  try {
    const response = await apiClient.delete(`/api/admin/marketing/campaigns/${campaignId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw new Error(error.response?.data?.message || "Failed to delete campaign");
  }
};


export const getFeaturedCourses = async () => {
  try {
    const response = await apiClient.get("/api/admin/marketing/featured-courses");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch featured courses",
    };
  }
};


export const addFeaturedCourse = async (data) => {
  try {
    const response = await apiClient.post("/api/admin/marketing/featured-courses", data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error adding featured course:", error);
    throw new Error(error.response?.data?.message || "Failed to add featured course");
  }
};


export const removeFeaturedCourse = async (featuredId) => {
  try {
    const response = await apiClient.delete(`/api/admin/marketing/featured-courses/${featuredId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error removing featured course:", error);
    throw new Error(error.response?.data?.message || "Failed to remove featured course");
  }
};


export const getCampaignAnalytics = async (campaignId = null) => {
  try {
    const url = campaignId 
      ? `/api/admin/marketing/campaigns/${campaignId}/analytics`
      : "/api/admin/marketing/analytics";
    const response = await apiClient.get(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching campaign analytics:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch analytics",
    };
  }
};
