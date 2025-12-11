"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

/**
 * AuthInitializer Component
 * Initializes authentication state when app starts
 * Must be placed in a client component high in the component tree (e.g., in app.tsx or layout)
 */
export function AuthInitializer() {
  useEffect(() => {
    // Initialize auth on app startup
    useAuthStore.getState().initializeAuth();
  }, []);

  return null; // This component doesn't render anything
}

export default AuthInitializer;
