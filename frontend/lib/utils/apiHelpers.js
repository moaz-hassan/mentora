import Cookies from "js-cookie";


export const getAuthToken = () => {
  const cookieToken = Cookies.get("authToken");
  if (cookieToken) {
    return cookieToken;
  }
    if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  
  return null;
};


export const getAuthHeaders = (token = null) => {
  const authToken = token || getAuthToken();
  
  if (authToken) {
    return {
      Authorization: `Bearer ${authToken}`,
    };
  }
  
  return {};
};

export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};


export const clearAuthTokens = () => {
  if (typeof window !== "undefined") {
    Cookies.remove("authToken");
    localStorage.removeItem("token");
  }
};
