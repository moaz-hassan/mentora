"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EnrollmentCard({ enrollment }) {
  const { Course, progress } = enrollment;
  const completionPercentage = progress?.completionPercentage || 0;

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={Course?.thumbnail_url || "/placeholder-course.jpg"}
          alt={Course?.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        {completionPercentage >= 100 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 hover:bg-green-600">
              <Award className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className="mb-2">
            {Course?.category || "General"}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
          {Course?.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {Course?.Instructor?.first_name} {Course?.Instructor?.last_name}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          {progress?.lastAccessed && (
            <p className="text-xs text-muted-foreground pt-2">
              Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/dashboard/student/courses/${Course?.id}/learn`}>
            <PlayCircle className="w-4 h-4 mr-2" />
            {completionPercentage > 0 ? "Continue Learning" : "Start Learning"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
