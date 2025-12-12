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
import { BookOpen, Mail, Lock, User, Loader2, CircleAlert, Eye, EyeOff } from "lucide-react";
import RegisterAnimation from "@/components/animations/SignUpAnimations";
import Link from "next/link";
import registerApiCall from "@/lib/apiCalls/auth/register.apiCalls";
import { toast } from "sonner";
import TooltipComponent from "@/components/common/TooltipComponent";
import InputInstructions from "@/components/common/InputInstructions";
import logo from "@/app/icon.png";
import Image from "next/image";

export default function RegisterPage() {
  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await registerApiCall(
        registerData.first_name,
        registerData.last_name,
        registerData.email,
        registerData.password,
        registerData.confirmPassword
      );
      if (response.success) {
        toast.success(response.message || "Registration successful");
      } else {
        toast.error(response.error || "Registration failed");
      }
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl gap-8 items-center">
        <div className="hidden lg:block lg:w-1/2">
          <RegisterAnimation />
        </div>
        <Card className="w-full lg:w-1/2 shadow-xl dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="space-y-3 text-center">
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                width={64}
                height={64}
                className="mx-auto w-10 h-12"
              />
            </Link>
            
            <CardTitle className="text-2xl font-bold dark:text-white">Create Account</CardTitle>
            <CardDescription className="dark:text-gray-300">Start your learning journey today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <div className="space-y-2 flex gap-2 *:w-1/2">
                <div>
                  <Label htmlFor="first-name" className="dark:text-gray-200">First Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="John"
                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      value={registerData.first_name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          first_name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="last-name" className="dark:text-gray-200">Last Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Doe"
                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      value={registerData.last_name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          last_name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">
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
                    <CircleAlert className="w-4 h-4 inline-block ml-1" />
                  </TooltipComponent>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                  />
                  {showPassword ? (
                    <Eye
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="dark:text-gray-200">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  {showConfirmPassword ? (
                    <Eye
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  )}
                </div>
              </div>
              <Button
                onClick={handleRegister}
                className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
