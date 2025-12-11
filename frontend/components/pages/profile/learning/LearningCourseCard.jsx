"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";


export function validateCourseCardData(course, progress) {
  const requiredFields = {
    title: course?.title,
    instructorName: course?.Instructor?.first_name || course?.Instructor?.last_name,
    progress: typeof progress === "number",
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}


export function shouldShowProgressBar(progress) {
  return typeof progress === "number" && progress < 100;
}

export default function LearningCourseCard({ course, progress, status }) {
  const completionPercentage = progress || 0;
  const isCompleted = completionPercentage >= 100;
  const isNotStarted = completionPercentage === 0;
  const instructorName = `${course?.Instructor?.first_name || ""} ${course?.Instructor?.last_name || ""}`.trim();
  const instructorInitials = `${course?.Instructor?.first_name?.[0] || ""}${course?.Instructor?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <Link href={`/dashboard/student/courses/${course?.id}/learn`}>
      <Card className={cn(
        "overflow-hidden h-full border bg-card/50 backdrop-blur-sm",
        "transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1",
        "cursor-pointer group"
      )}>
        {}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={course?.thumbnail_url || "/placeholder-course.jpg"}
            alt={course?.title || "Course thumbnail"}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          
          {}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
          </div>

          {}
          {isCompleted && (
            <Badge className="absolute top-3 right-3 bg-emerald-500 hover:bg-emerald-600 gap-1 shadow-md">
              <Award className="h-3 w-3" />
              Completed
            </Badge>
          )}
          {status === "archived" && (
            <Badge variant="secondary" className="absolute top-3 left-3 shadow-md">
              Archived
            </Badge>
          )}
        </div>

        {}
        <CardContent className="p-4 space-y-3">
          {}
          <h3 className="font-semibold text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {course?.title || "Untitled Course"}
          </h3>
          
          {}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border">
              <AvatarImage src={course?.Instructor?.Profile?.avatar_url} />
              <AvatarFallback className="text-[10px] bg-muted">
                {instructorInitials}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {instructorName || "Unknown Instructor"}
            </p>
          </div>

          {}
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                "font-medium flex items-center gap-1",
                isCompleted && "text-emerald-600 dark:text-emerald-400",
                isNotStarted && "text-muted-foreground",
                !isCompleted && !isNotStarted && "text-blue-600 dark:text-blue-400"
              )}>
                {isCompleted ? (
                  <>
                    <Award className="h-3 w-3" />
                    Completed
                  </>
                ) : isNotStarted ? (
                  <>
                    <Clock className="h-3 w-3" />
                    Not started
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3 w-3" />
                    In progress
                  </>
                )}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress 
              value={completionPercentage} 
              className={cn(
                "h-1.5",
                isCompleted && "[&>div]:bg-emerald-500"
              )} 
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
