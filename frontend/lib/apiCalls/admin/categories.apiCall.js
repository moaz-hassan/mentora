import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

export const categoriesAPI = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  create: async (data) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_URL}/api/categories`, data, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  update: async (id, data) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`${API_URL}/api/categories/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  delete: async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`${API_URL}/api/categories/${id}`, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  }
};

export const subcategoriesAPI = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subcategories`);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  create: async (data) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_URL}/api/subcategories`, data, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  update: async (id, data) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`${API_URL}/api/subcategories/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  delete: async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`${API_URL}/api/subcategories/${id}`, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  }
};
