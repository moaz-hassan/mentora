"use client";
import { useEffect } from "react";
import AuthProvider from "@/components/AuthProvider";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);
  return <AuthProvider>{children}</AuthProvider>;
}