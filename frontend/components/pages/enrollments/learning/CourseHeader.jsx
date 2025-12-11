"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, MessageCircle, Loader2, Star } from "lucide-react";
import CertificateButton from "./CertificateButton";
import RatingModal from "@/components/modals/RatingModal";
import { joinChat } from "@/lib/apiCalls/chat/chat.apiCall";
import { toast } from "sonner";


export default function CourseHeader({
  courseTitle,
  instructorName,
  instructorAvatar,
  progressPercentage = 0,
  courseId,
  chatMembership,
}) {
  const router = useRouter();
  const [joinLoading, setJoinLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  
  const getInitials = (name) => {
    if (!name) return "IN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  
  const handleJoinChat = async () => {
    if (!courseId) return;

    
    if (chatMembership?.isMember && chatMembership?.roomId) {
      router.push(`/chats/${chatMembership.roomId}`);
      return;
    }

    
    setJoinLoading(true);
    try {
      const response = await joinChat(courseId);
      if (response.success) {
        const chatId = response.data.room_id;
        router.push(`/chats/${chatId}`);
      } else {
        toast.error(response.message || "Failed to join chat");
      }
    } catch (error) {
      console.error("Error joining chat:", error);
      toast.error("An error occurred while joining the chat");
    } finally {
      setJoinLoading(false);
    }
  };

  
  const handleRatingSuccess = () => {
    toast.success("Thank you for your rating!");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {}
        <div className="flex items-center gap-4">
          <Link
            href="/enrollments"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Enrollments
          </Link>

          <div className="hidden sm:flex items-center gap-3 border-l pl-4">
            <div className="max-w-md">
              <h1 className="text-sm font-medium truncate">{courseTitle}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={instructorAvatar} alt={instructorName} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(instructorName)}
                  </AvatarFallback>
                </Avatar>
                <span>{instructorName}</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center gap-3">
          {}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Your Progress</span>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="w-24 h-2" />
              <span className="text-xs font-medium text-primary">
                {progressPercentage}% Complete
              </span>
            </div>
          </div>

          {}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRatingModal(true)}
            className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
          >
            <Star className="h-4 w-4 fill-current" />
            <span className="hidden md:inline">Rate Course</span>
          </Button>

          {}
          <Button
            variant="outline"
            size="sm"
            onClick={handleJoinChat}
            disabled={joinLoading}
            className="hidden sm:flex items-center gap-1.5"
          >
            {joinLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            <span className="hidden md:inline">
              {joinLoading ? "Joining..." : chatMembership?.isMember ? "Open Chat" : "Join Chat"}
            </span>
          </Button>

          {}
          <CertificateButton
            courseId={courseId}
            completionPercentage={progressPercentage}
            className="hidden sm:flex"
          />

          {}
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        courseId={courseId}
        courseName={courseTitle}
        onSubmitSuccess={handleRatingSuccess}
      />
    </header>
  );
}


