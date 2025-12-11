import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LoadingState - Skeleton loader for the learning page
 * Displays placeholder content while data is being fetched
 */
const LoadingState = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background h-14 flex items-center px-4">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="h-4 w-24" />
          <div className="hidden sm:flex items-center gap-3 border-l pl-4">
            <div>
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-2 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Skeleton */}
        <aside className="w-80 border-r bg-muted/30 hidden lg:block">
          {/* Progress section */}
          <div className="p-4 border-b">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>

          {/* Curriculum title */}
          <div className="px-4 py-3 border-b">
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Sections */}
          <div className="p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="pl-4 space-y-2">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1">
          <div className="max-w-4xl mx-auto p-4 lg:p-6">
            {/* Video Player Skeleton */}
            <Skeleton className="w-full aspect-video rounded-lg mb-4" />

            {/* Lesson Header Skeleton */}
            <div className="py-4">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            {/* Navigation Buttons Skeleton */}
            <div className="flex justify-between py-4">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-4 border-b pb-2 mb-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoadingState;
