"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Mail,
  Lock,
  Loader2,
  CircleAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import LoginAnimation from "@/components/animations/LoginAnimations";
import Link from "next/link";
import loginApiCall from "@/lib/apiCalls/auth/login.apiCall";
import { toast } from "sonner";
import TooltipComponent from "@/components/common/TooltipComponent";
import InputInstructions from "@/components/common/InputInstructions";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import useAuthStore from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {setAuth} = useAuthStore();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginApiCall(loginData.email, loginData.password);      
      if (response.success) {
        Cookies.set("authToken", response.data.token);
        localStorage.getItem("forgot_password_timer")
          ? localStorage.removeItem("forgot_password_timer")
          : null;          
        setAuth(response.data.user);
        toast.success(response.message || "Login successful");
        router.push("/");
      } else {
        toast.error(response.error || "Failed to login");
      }
    } catch (error) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl gap-8 items-center">
        <div className="hidden lg:block lg:w-1/2">
          <LoginAnimation />
        </div>
        <Card className="w-full lg:w-1/2 shadow-xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">
                  Password{" "}
                  <TooltipComponent
                    content={
                      <InputInstructions
                        header="Password Instructions"
                        instructions={[
                          "must be at least 6 characters long!",
                          "must contain at least one uppercase letter!",
                          "must contain at least one lowercase letter!",
                          "must contain at least one number!",
                          "must contain at least one special character!",
                        ]}
                      />
                    }
                  >
                    <CircleAlert className="w-4 h-4" />
                  </TooltipComponent>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  />
                  {showPassword ? (
                    <Eye
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Sign In
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
