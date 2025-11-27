import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get all coupons
 */
export const getAllCoupons = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/coupons`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch coupons",
    };
  }
};

/**
 * Get coupon analytics
 */
export const getCouponAnalytics = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/coupons/analytics`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching coupon analytics:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch analytics",
    };
  }
};

/**
 * Create a new coupon
 */
export const createCoupon = async (couponData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/coupons`, couponData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to create coupon");
  }
};

/**
 * Update a coupon
 */
export const updateCoupon = async (couponId, couponData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`${API_URL}/api/admin/coupons/${couponId}`, couponData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to update coupon");
  }
};

/**
 * Update coupon status
 */
export const updateCouponStatus = async (couponId, status) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch(`${API_URL}/api/admin/coupons/${couponId}/status`, { status }, { headers });
    return response.data;
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update status",
    };
  }
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (couponId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/api/admin/coupons/${couponId}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete coupon",
    };
  }
};
