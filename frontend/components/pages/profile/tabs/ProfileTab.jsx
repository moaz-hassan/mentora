"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, Camera, User, Link as LinkIcon, Twitter, Linkedin, Github, Globe } from "lucide-react";
import { toast } from "sonner";
import { useProfileSettings } from "@/hooks/profile/useProfileSettings";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  headline: z.string().max(100, "Headline must be less than 100 characters").optional(),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  social_links: z.object({
    twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
    github: z.string().url("Invalid URL").optional().or(z.literal("")),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
  }).optional(),
});

const socialFields = [
  { name: "twitter", label: "Twitter", icon: Twitter, placeholder: "https://twitter.com/username" },
  { name: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
  { name: "github", label: "GitHub", icon: Github, placeholder: "https://github.com/username" },
  { name: "website", label: "Website", icon: Globe, placeholder: "https://yourwebsite.com" },
];

export default function ProfileTab({ userData, profileData, onRefetch }) {
  const { isSaving, updateProfile } = useProfileSettings();
  const [avatarPreview, setAvatarPreview] = useState(profileData?.avatar_url || "");

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: userData?.first_name || "",
      last_name: userData?.last_name || "",
      bio: profileData?.bio || "",
      headline: profileData?.headline || "",
      avatar_url: profileData?.avatar_url || "",
      social_links: {
        twitter: profileData?.social_links?.twitter || "",
        linkedin: profileData?.social_links?.linkedin || "",
        github: profileData?.social_links?.github || "",
        website: profileData?.social_links?.website || "",
      },
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
      onRefetch?.();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleAvatarUrlChange = (url) => {
    setAvatarPreview(url);
    form.setValue("avatar_url", url);
  };

  const initials = `${userData?.first_name?.[0] || ""}${userData?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <Card className="border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-muted-foreground" />
                Profile Picture
              </CardTitle>
              <CardDescription>Choose a photo that represents you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-2 shadow-md transition-transform group-hover:scale-105">
                    <AvatarImage src={avatarPreview} className="object-cover" />
                    <AvatarFallback className="text-2xl font-semibold bg-muted">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem className="flex-1 w-full">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/your-photo.jpg"
                          className="bg-background"
                          {...field}
                          onChange={(e) => handleAvatarUrlChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>Enter a direct link to your profile image</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Personal Information
              </CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Student, Developer, Designer..." 
                        className="bg-background" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>A short tagline about yourself</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a few sentences about yourself..."
                        className="resize-none min-h-[120px] bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Share your story</span>
                      <span className={cn(
                        "tabular-nums",
                        (field.value?.length || 0) > 450 && "text-amber-500",
                        (field.value?.length || 0) > 500 && "text-destructive"
                      )}>
                        {field.value?.length || 0}/500
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                Social Links
              </CardTitle>
              <CardDescription>Connect your social profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialFields.map((social) => (
                  <FormField
                    key={social.name}
                    control={form.control}
                    name={`social_links.${social.name}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <social.icon className="h-4 w-4" />
                          {social.label}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={social.placeholder} 
                            className="bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving}
              size="lg"
              className="gap-2 min-w-[140px]"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
