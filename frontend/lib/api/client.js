/**
 * API Client
 * Purpose: Centralized API client with authentication and error handling
 */

import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Get authentication token from cookies (authToken) or fallback to localStorage
 */
const getToken = () => {
  if (typeof window !== 'undefined') {
    // First try to get from cookies (preferred)
    const cookieToken = Cookies.get('authToken');
    if (cookieToken) {
      return cookieToken;
    }
    // Fallback to localStorage for backward compatibility
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Clear authentication tokens from both cookies and localStorage
 */
const clearTokens = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove('authToken');
    localStorage.removeItem('token');
  }
};

/**
 * Main API client function
 * @param {string} endpoint - API endpoint (e.g., '/api/admin/analytics/overview')
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function apiClient(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Add body if present and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    // Parse response
    const data = await response.json();

    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Client Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
export const get = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiClient(url, { method: 'GET' });
};

/**
 * POST request
 */
export const post = (endpoint, body = {}) => {
  return apiClient(endpoint, {
    method: 'POST',
    body,
  });
};

/**
 * PUT request
 */
export const put = (endpoint, body = {}) => {
  return apiClient(endpoint, {
    method: 'PUT',
    body,
  });
};

/**
 * PATCH request
 */
export const patch = (endpoint, body = {}) => {
  return apiClient(endpoint, {
    method: 'PATCH',
    body,
  });
};

/**
 * DELETE request
 */
export const del = (endpoint) => {
  return apiClient(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Upload file
 */
export const upload = async (endpoint, formData) => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }
  
  return response.json();
};

export default {
  get,
  post,
  put,
  patch,
  del,
  upload,
};
