import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing authentication state
 * Checks for authToken in cookies and manages login/logout
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get cookie value by name
  const getCookie = useCallback((name) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getCookie("authToken");
        if (token) {
          setIsAuthenticated(true);
          // Try to get user data from localStorage if available
          const userData = localStorage.getItem("user_data");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [getCookie]);

  // Login function
  const login = useCallback((userData, token) => {
    try {
      // Token should already be in cookies from backend
      setIsAuthenticated(true);
      setUser(userData);
      // Store user data in localStorage for quick access
      localStorage.setItem("user_data", JSON.stringify(userData));
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("user_data");
      localStorage.removeItem("course_creation_draft");

      // Clear cookies by setting expiration date to past
      if (typeof document !== "undefined") {
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }

      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }, []);

  // Get auth token from cookies
  const getToken = useCallback(() => {
    return getCookie("authToken");
  }, [getCookie]);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    getToken,
  };
}
