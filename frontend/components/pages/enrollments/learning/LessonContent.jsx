"use client";

import { useRef, useEffect } from "react";
import VideoPlayer from "@/components/media/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

/**
 * LessonContent - Conditionally renders video player or text content
 * based on lesson type
 * 
 * Features:
 * - Video lessons: tracks progress and auto-completes at 90%
 * - Text lessons: manual "Mark as Complete" checkbox
 */
export default function LessonContent({
  lesson,
  isLoading = false,
  onVideoEnd,
  onVideoProgress,
  onMarkComplete,
  isCompleted = false,
  autoplay = false,
}) {
  // Track if 90% threshold has been triggered to avoid multiple calls
  const hasTriggered90 = useRef(false);
  // Track the current lesson ID to detect changes
  const currentLessonIdRef = useRef(null);

  // Reset trigger when lesson changes
  useEffect(() => {
    if (lesson?.id && lesson.id !== currentLessonIdRef.current) {
      currentLessonIdRef.current = lesson.id;
      hasTriggered90.current = false;
    }
  }, [lesson?.id]);

  // Handle video progress - trigger completion at 90%
  const handleProgress = (percentage) => {
    if (percentage >= 90 && !hasTriggered90.current && onVideoProgress && !isCompleted) {
      hasTriggered90.current = true;
      onVideoProgress(percentage);
    }
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // No lesson selected
  if (!lesson) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Select a lesson to start learning</p>
      </div>
    );
  }

  // Text lesson
  if (lesson.lesson_type === "text") {
    return (
      <div className="bg-muted/30 rounded-lg p-6 min-h-[300px]">
        <div
          className="prose prose-sm dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: lesson.content || "" }}
        />
        
        {/* Mark as Complete checkbox for text lessons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Lesson Completed</span>
            </div>
          ) : (
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={(checked) => {
                  if (checked && onMarkComplete) {
                    onMarkComplete();
                  }
                }}
              />
              <span className="text-sm font-medium">Mark as Complete</span>
            </label>
          )}
        </div>
      </div>
    );
  }

  // Video lesson
  const videoPublicId = lesson.video_public_id || lesson.video_url;

  if (!videoPublicId) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Video not available</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <VideoPlayer
        publicId={videoPublicId}
        onNextLesson={onVideoEnd}
        onProgress={handleProgress}
        autoPlay={autoplay}
        showNextButton={true}
      />
    </div>
  );
}
