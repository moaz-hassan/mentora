"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2Icon,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import resetPassword from "@/lib/apiCalls/auth/resetPassword.apiCalls";
import ResetPasswordAnimation from "@/components/animations/ResetPasswordAnimation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Extract email and token from URL on mount
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const response = await resetPassword(
        email,
        token,
        newPassword,
        confirmPassword
      );

      if (response.success) {
        toast.success(response.message || "Password reset successful!");
        setResetSuccess(true);
      }
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl gap-8 items-center">
        <div className="hidden lg:block lg:w-1/2">
          <ResetPasswordAnimation />
        </div>
        
        <Card className="w-full lg:w-1/2 shadow-xl">
          <CardHeader className="space-y-3">
            <Link
              href="/login"
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
            </Link>
            
            <div className="mx-auto bg-teal-600 w-16 h-16 rounded-full flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-center">
              Reset Password
            </CardTitle>
            
            <CardDescription className="text-center">
              {resetSuccess
                ? "Password changed successfully"
                : "Enter your new password"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!resetSuccess ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10 bg-gray-50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token">Reset Token</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="token"
                      type="text"
                      placeholder="Enter reset token"
                      className="pl-10"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Password Reset Successful!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your password has been changed successfully.
                  </p>
                  <p className="text-sm text-gray-600">
                    You can now log in with your new password.
                  </p>
                </div>

                <Link href="/login">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 transition-colors">
                    Go to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 6s linear infinite;
        }
      `}</style>
    </div>
  );
}