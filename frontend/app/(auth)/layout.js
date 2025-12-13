"use client";
import { useEffect } from "react";
import AuthProvider from "@/components/AuthProvider";
import useAuthStore from "@/store/authStore";
import { useRouter ,usePathname} from "next/navigation";

export default function AuthLayout({ children }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated && pathname !== "/reset-password") {
      router.push("/");
    }
  }, [isAuthenticated, router, pathname]);
  return <AuthProvider>{children}</AuthProvider>;
}