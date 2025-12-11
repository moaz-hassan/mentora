"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StickyNote, Clock, Flag } from "lucide-react";


export default function LessonHeader({
  lessonTitle,
  instructorName,
  instructorAvatar,
  duration,
  onNotesClick,
  onReportClick,
}) {
  
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  
  const getInitials = (name) => {
    if (!name) return "IN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        {}
        <h1 className="text-xl font-semibold mb-2">{lessonTitle}</h1>

        {}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={instructorAvatar} alt={instructorName} />
              <AvatarFallback className="text-xs">
                {getInitials(instructorName)}
              </AvatarFallback>
            </Avatar>
            <span>{instructorName}</span>
          </div>

          {duration > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>
      </div>

      {}
      <Button
        variant="secondary"
        size="sm"
        onClick={onNotesClick}
        className="gap-2"
      >
        <StickyNote className="h-4 w-4" />
        Notes
      </Button>

      {}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        onClick={onReportClick}
        title="Report Issue"
      >
        <Flag className="h-4 w-4" />
      </Button>
    </div>
  );
}
