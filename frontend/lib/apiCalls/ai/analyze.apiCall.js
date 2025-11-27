import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Analyze content with AI
 * @param {string} content - Content to analyze
 * @param {string} analysisType - Type of analysis (moderation, summary, insights, categorization)
 * @returns {Promise<object>} Analysis results
 */
export default async function analyze(content, analysisType) {
  try {
    const response = await apiClient.post("/api/ai/analyze", {
      content,
      analysisType,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
