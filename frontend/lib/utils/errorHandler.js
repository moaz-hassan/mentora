


export const handleApiError = (error, router = null) => {
  
  console.error("API Error:", {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    stack: error.stack,
  });

  
  if (!error.response) {
    if (error.request) {
      return "Unable to connect to server. Please check your internet connection.";
    }
    return "An unexpected error occurred. Please try again.";
  }

  
  const status = error.response.status;
  const data = error.response.data;

  switch (status) {
    case 400:
      
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.map((err) => err.msg).join(", ");
      }
      return data.message || "Invalid request. Please check your input.";

    case 401:
      
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
      
      return "You don't have permission to access this resource.";

    case 404:
      
      return data.message || "The requested resource was not found.";

    case 409:
      
      return data.message || "A conflict occurred. The resource may already exist.";

    case 422:
      
      return data.message || "Unable to process your request. Please check your input.";

    case 429:
      
      return "Too many requests. Please wait a moment and try again.";

    case 500:
      
      return "Something went wrong on our end. Please try again later.";

    case 502:
      
      return "Server is temporarily unavailable. Please try again later.";

    case 503:
      
      return "Service is temporarily unavailable. Please try again later.";

    case 504:
      
      return "Request timed out. Please try again.";

    default:
      return data.message || "An error occurred. Please try again.";
  }
};


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

      
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500 &&
        error.response.status !== 429
      ) {
        throw error;
      }

      
      if (attempt === maxRetries - 1) {
        throw error;
      }

      
      const delay = initialDelay * Math.pow(2, attempt);
      
      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
      );

      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};


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

  
  
  if (process.env.NODE_ENV === "production") {
    
  }

  return errorLog;
};


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


export const isNetworkError = (error) => {
  return !error.response && error.request;
};


export const isAuthError = (error) => {
  return error.response && error.response.status === 401;
};


export const isValidationError = (error) => {
  return (
    error.response &&
    (error.response.status === 400 || error.response.status === 422)
  );
};
