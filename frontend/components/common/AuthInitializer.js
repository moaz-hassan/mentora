"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";


export function AuthInitializer() {
  useEffect(() => {
    
    useAuthStore.getState().initializeAuth();
  }, []);

  return null; 
}

export default AuthInitializer;
