"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {}
          <div className="flex-1 space-y-6">
            {}
            <Card className="overflow-hidden border bg-card/50">
              {}
              <Skeleton className="h-24 w-full" />
              
              <CardContent className="relative px-6 pb-6">
                <div className="flex flex-col sm:flex-row gap-6 -mt-12">
                  {}
                  <Skeleton className="h-24 w-24 rounded-full border-4 border-background shrink-0 self-center sm:self-start" />
                  
                  {}
                  <div className="flex-1 space-y-3 pt-2 text-center sm:text-left">
                    <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                    <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
                    <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
                  </div>

                  {}
                  <div className="flex gap-2 self-center sm:self-start sm:pt-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                </div>

                {}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-muted/30">
                      <Skeleton className="h-5 w-5 rounded mb-2" />
                      <Skeleton className="h-7 w-10 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-1.5">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 flex-1 rounded-lg" />
                ))}
              </div>
            </div>

            {}
            <div className="space-y-6">
              <Card className="border bg-card/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {}
          <div className="hidden lg:block w-80 shrink-0">
            <Card className="border bg-card/50">
              <CardContent className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
              <CardContent className="p-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border-b last:border-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
