import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorCoursesSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" /> {/* Title */}
          <Skeleton className="h-4 w-64" /> {/* Subtitle */}
        </div>
        <Skeleton className="h-10 w-40" /> {/* Create Button */}
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" /> {/* Label */}
                <Skeleton className="h-8 w-12" /> {/* Number */}
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" /> {/* Icon Box */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter & Search Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" /> {/* Search Input */}
            <Skeleton className="h-10 w-32" /> {/* Select Dropdown */}
          </div>
        </CardContent>
      </Card>

      {/* Course List Skeleton (Simulate 3 items) */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Thumbnail Placeholder */}
                <Skeleton className="w-full md:w-48 h-32 rounded-lg flex-shrink-0" />

                {/* Content Placeholders */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-full max-w-md space-y-2">
                      <Skeleton className="h-6 w-3/4" /> {/* Title */}
                      <Skeleton className="h-4 w-full" /> {/* Description */}
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />{" "}
                    {/* Status Badge */}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
