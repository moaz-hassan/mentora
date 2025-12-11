"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertTriangle, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useProfileSettings } from "@/hooks/profile/useProfileSettings";
import { cn } from "@/lib/utils";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AccountSettingsTab({ userData }) {
  const { isSaving, updatePassword } = useProfileSettings();
  const [isResending, setIsResending] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await updatePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      toast.success("Password updated successfully!");
      form.reset();
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error("Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

  const PasswordInput = ({ field, placeholder, show, setShow }) => (
    <div className="relative">
      <Input 
        type={show ? "text" : "password"} 
        placeholder={placeholder} 
        className="bg-background pr-10"
        {...field} 
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Email Verification Status */}
      <Card className="border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            Email Verification
          </CardTitle>
          <CardDescription>Your account verification status</CardDescription>
        </CardHeader>
        <CardContent>
          {userData?.is_email_verified ? (
            <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="ml-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    Your email is verified
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                    ({userData?.email})
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="ml-2">
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="font-medium text-amber-700 dark:text-amber-300">
                      Email not verified
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 text-sm block">
                      Please verify {userData?.email} to access all features
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Resend Verification Email
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Change Password
          </CardTitle>
          <CardDescription>Keep your account secure with a strong password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput 
                        field={field} 
                        placeholder="Enter your current password" 
                        show={showCurrentPassword}
                        setShow={setShowCurrentPassword}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          field={field} 
                          placeholder="Enter new password" 
                          show={showNewPassword}
                          setShow={setShowNewPassword}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          field={field} 
                          placeholder="Confirm new password" 
                          show={showConfirmPassword}
                          setShow={setShowConfirmPassword}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSaving} className="gap-2 min-w-[140px]">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
