"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { initiatePrivateChat } from "@/lib/apiCalls/chat/initiatePrivateChat";

export function MessageInstructorButton({
  instructorId,
  instructorName,
  courseId,
  variant = "default",
  size = "default",
  className = "",
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMessageInstructor = async () => {
    if (!instructorId) {
      alert("Instructor information not available");
      return;
    }

    setLoading(true);

    try {
      const result = await initiatePrivateChat(instructorId, courseId);

      if (result.success) {
        // Navigate to the chat page
        const userRole = localStorage.getItem("user_role") || "student";
        router.push(`/dashboard/${userRole}/messages`);
      } else {
        alert(result.error || "Failed to start chat. Please try again.");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMessageInstructor}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {loading ? "Starting chat..." : `Message ${instructorName || "Instructor"}`}
    </Button>
  );
}
