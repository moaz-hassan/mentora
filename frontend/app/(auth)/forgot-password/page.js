"use client";
import React, { useState, useEffect } from "react";
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
import { Mail, ArrowLeft, CheckCircle2, Loader2Icon } from "lucide-react";
import ForgotPasswordAnimation from "@/components/animations/ForgotPasswordAnimations";
import Link from "next/link";
import { toast } from "sonner";
import forgotPassword from "@/lib/apiCalls/auth/forgotPassword.apiCall";

const STORAGE_KEY = "forgot_password_timer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ableToResend, setAbleToResend] = useState(true);
  const [ableToResendTimer, setAbleToResendTimer] = useState(60);

  
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const { email: storedEmail, expiresAt } = JSON.parse(storedData);
        const now = Date.now();
        
        if (expiresAt > now) {
          
          const remainingSeconds = Math.ceil((expiresAt - now) / 1000);
          setEmail(storedEmail);
          setResetSent(true);
          setAbleToResend(false);
          setAbleToResendTimer(remainingSeconds);
        } else {
          
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error parsing stored timer data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  
  useEffect(() => {
    if (!resetSent || ableToResend) return;

    const interval = setInterval(() => {
      setAbleToResendTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setAbleToResend(true);
          setResetSent(false);
          localStorage.removeItem(STORAGE_KEY);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetSent, ableToResend]);

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      const response = await forgotPassword(email);

      if (response.success) {
        toast.success(response.message);
        
        
        const expiresAt = Date.now() + 60000; 
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ email, expiresAt })
        );

        setResetSent(true);
        setAbleToResend(false);
        setAbleToResendTimer(60);
      }
    } catch (error) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl gap-8 items-center">
        <div className="hidden lg:block lg:w-1/2">
          <ForgotPasswordAnimation />
        </div>
        <Card className="w-full lg:w-1/2 shadow-xl bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-3">
            <Link
              href="/login"
              className="flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
            </Link>
            <div className="mx-auto bg-teal-600 w-16 h-16 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              {resetSent
                ? "Check your email"
                : "We'll send you reset instructions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetSent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-teal-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleForgotPassword}
                  disabled={loading || !ableToResend}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                >
                  {loading ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    We&apos;ve sent password reset instructions to
                  </p>
                  <p className="font-medium text-white">{email}</p>
                  <p className="text-sm text-slate-400 mt-4">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button
                      disabled={loading || !ableToResend}
                      onClick={() => setResetSent(false)}
                      className="text-teal-400 hover:text-teal-300 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      try again in {ableToResendTimer} seconds
                    </button>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}