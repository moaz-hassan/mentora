"use client";

import { useEffect, useState } from "react";
import ProfileForm from "@/components/student/ProfileForm";
import SecuritySettings from "@/components/student/SecuritySettings";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/profile", {
          withCredentials: true,
        });
        if (response.data.success) {
          setProfileData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleSave = async (data) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/profile",
        data,
        { withCredentials: true }
      );
      if (response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error; // Let the form handle the error state
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and account security.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm initialData={profileData} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings user={profileData?.user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
