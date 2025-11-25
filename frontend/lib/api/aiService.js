import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// AI Service API calls
export const aiService = {
  /**
   * Send a chat message to the AI
   * @param {string} message - The user's message
   * @param {object} context - Context information (page, data, etc.)
   * @returns {Promise<object>} AI response
   */
  async chat(message, context = {}) {
    try {
      const response = await apiClient.post("/api/ai/chat", {
        message,
        context,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get example questions based on user role
   * @returns {Promise<object>} Example questions
   */
  async getExamples() {
    try {
      const response = await apiClient.get("/api/ai/examples");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Analyze content with AI
   * @param {string} content - Content to analyze
   * @param {string} analysisType - Type of analysis (moderation, summary, insights, categorization)
   * @returns {Promise<object>} Analysis results
   */
  async analyze(content, analysisType) {
    try {
      const response = await apiClient.post("/api/ai/analyze", {
        content,
        analysisType,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get AI suggestions based on context
   * @param {object} context - Context for suggestions
   * @returns {Promise<object>} AI suggestions
   */
  async getSuggestions(context) {
    try {
      const response = await apiClient.post("/api/ai/suggest", {
        context,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default aiService;
