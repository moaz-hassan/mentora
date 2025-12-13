import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import forgotPassword from "@/lib/apiCalls/auth/forgotPassword.apiCall";

export default function SecurityTab({ user }) {
  const [saving, setSaving] = useState(false);
  
  const handlePasswordReset = async () => {
    setSaving(true);
    try {
      const response = await forgotPassword(user.email);
      if (response.success) {
        toast.success("Password reset link sent to your email!");
      }
    } catch (error) {
      toast.error(
        error.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-t border-gray-200 dark:border-neutral-800 pt-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Change Password
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                To change your password, we'll send a secure reset link to your
                email address.
              </p>
            </div>
          </div>
          <Button
            onClick={handlePasswordReset}
            disabled={saving || !user?.email}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            {saving ? "Sending..." : "Send Password Reset Link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
