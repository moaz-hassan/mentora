"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import Cookies from "js-cookie";

export default function AuthProvider({ children }) {
  const token = Cookies.get("authToken");
  const {user, fetchUser, clearAuth} = useAuthStore();

  useEffect(() => {
    if (token && !user && !localStorage.getItem("auth-store")) {
      console.log("AuthProvider: Token found, but User missing. Fetching...");
      fetchUser();
    }else if(!token){
      console.log("AuthProvider: No Token found. Clearing Auth...");
      clearAuth()
    }
  }, [token, user, fetchUser]);
  return <>{children}</>;
}