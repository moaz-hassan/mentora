"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  BookOpen, 
  Award, 
  Calendar, 
  CheckCircle2,
  TrendingUp,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";


export function formatUsername(username) {
  if (!username) return "";
  return username.startsWith("@") ? username : `@${username}`;
}


function formatMemberSince(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ProfileHeader({ user, profile, enrollmentCount = 0, certificateCount = 0 }) {
  const router = useRouter();

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "User";
  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() || "U";
  const headline = profile?.headline || "";
  const username = profile?.username || user?.email?.split("@")[0] || "";
  const isVerified = user?.is_email_verified;
  const memberSince = formatMemberSince(user?.created_at);

  const handleViewPublicProfile = () => {
    router.push(`/profile/${username}`);
  };

  const handleSettings = () => {
    router.push("/profile?tab=account-settings");
  };

  const stats = [
    { 
      icon: BookOpen, 
      label: "Enrolled", 
      value: enrollmentCount,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50"
    },
    { 
      icon: Award, 
      label: "Completed", 
      value: certificateCount,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50"
    },
    { 
      icon: TrendingUp, 
      label: "In Progress", 
      value: Math.max(0, enrollmentCount - certificateCount),
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50"
    },
  ];

  return (
    <Card className="overflow-hidden border bg-card/50 backdrop-blur-sm">
      {}
      <div className="relative h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)]" />
      </div>

      <CardContent className="relative px-6 pb-6">
        {}
        <div className="flex flex-col sm:flex-row gap-6 -mt-12">
          {}
          <div className="shrink-0 self-center sm:self-start">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg ring-2 ring-border">
                <AvatarImage src={profile?.avatar_url} alt={fullName} className="object-cover" />
                <AvatarFallback className="text-2xl font-semibold bg-muted text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                  <div className="bg-emerald-500 rounded-full p-1">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="flex-1 min-w-0 text-center sm:text-left pt-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {fullName}
              </h1>
              {isVerified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            {headline && (
              <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                {headline}
              </p>
            )}
            
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
              <span>{formatUsername(username)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {memberSince}
              </span>
            </div>
          </div>

          {}
          <div className="shrink-0 flex items-center gap-2 self-center sm:self-start sm:pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSettings}
              className="gap-1.5"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleViewPublicProfile}
              className="gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Public Profile</span>
            </Button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={cn(
                "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                "hover:scale-[1.02] cursor-default",
                stat.bgColor
              )}
            >
              <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
              <span className="text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
