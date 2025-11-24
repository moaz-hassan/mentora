/**
 * Error Handler Utility
 * Centralized error handling for API calls
 */

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - The error object from axios or fetch
 * @param {Function} router - Next.js router for redirects (optional)
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, router = null) => {
  // Log error for debugging
  console.error("API Error:", {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    stack: error.stack,
  });

  // Handle network errors
  if (!error.response) {
    if (error.request) {
      return "Unable to connect to server. Please check your internet connection.";
    }
    return "An unexpected error occurred. Please try again.";
  }

  // Handle HTTP status codes
  const status = error.response.status;
  const data = error.response.data;

  switch (status) {
    case 400:
      // Bad Request - return specific validation errors if available
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.map((err) => err.msg).join(", ");
      }
      return data.message || "Invalid request. Please check your input.";

    case 401:
      // Unauthorized - clear auth and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        if (router) {
          router.push("/login");
        } else if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return "Your session has expired. Please log in again.";

    case 403:
      // Forbidden
      return "You don't have permission to access this resource.";

    case 404:
      // Not Found
      return data.message || "The requested resource was not found.";

    case 409:
      // Conflict
      return data.message || "A conflict occurred. The resource may already exist.";

    case 422:
      // Unprocessable Entity
      return data.message || "Unable to process your request. Please check your input.";

    case 429:
      // Too Many Requests
      return "Too many requests. Please wait a moment and try again.";

    case 500:
      // Internal Server Error
      return "Something went wrong on our end. Please try again later.";

    case 502:
      // Bad Gateway
      return "Server is temporarily unavailable. Please try again later.";

    case 503:
      // Service Unavailable
      return "Service is temporarily unavailable. Please try again later.";

    case 504:
      // Gateway Timeout
      return "Request timed out. Please try again.";

    default:
      return data.message || "An error occurred. Please try again.";
  }
};

/**
 * Fetch with retry logic and exponential backoff
 * @param {Function} fetchFn - The async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise} Result of the fetch function
 */
export const fetchWithRetry = async (
  fetchFn,
  maxRetries = 3,
  initialDelay = 1000
) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500 &&
        error.response.status !== 429
      ) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      
      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Log error with context
 * @param {Error} error - The error object
 * @param {Object} context - Additional context about the error
 */
export const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
  };

  if (error.response) {
    errorLog.response = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
    };
  }

  if (error.request) {
    errorLog.request = {
      method: error.request.method,
      url: error.request.url,
    };
  }

  console.error("Error Log:", errorLog);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or your own logging endpoint
  if (process.env.NODE_ENV === "production") {
    // Example: sendToErrorTrackingService(errorLog);
  }

  return errorLog;
};

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
export const createErrorResponse = (message, statusCode = 500, details = {}) => {
  return {
    success: false,
    error: {
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error object
 * @returns {boolean} True if authentication error
 */
export const isAuthError = (error) => {
  return error.response && error.response.status === 401;
};

/**
 * Check if error is a validation error
 * @param {Error} error - The error object
 * @returns {boolean} True if validation error
 */
export const isValidationError = (error) => {
  return (
    error.response &&
    (error.response.status === 400 || error.response.status === 422)
  );
};
