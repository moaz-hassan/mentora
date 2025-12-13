
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card"; 

export default function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Skeleton className="h-6 w-32" /> 
          <Skeleton className="h-8 w-64 rounded-full" /> 
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-20" /> 
            <Skeleton className="h-10 w-20 rounded" /> 
            <Skeleton className="h-8 w-8 rounded-full" /> 
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-6 w-full max-w-md" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" /> 
              <Skeleton className="h-4 w-16" /> 
              <Skeleton className="h-4 w-20" /> 
            </div>
          </div>

          <Card className="md:col-span-1 p-0 overflow-hidden">
            <Skeleton className="w-full h-48 bg-gray-200 dark:bg-neutral-700" />
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          {[1, 2, 3].map(
            (
              i 
            ) => (
              <Card key={`section-${i}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  {[1, 2].map((j) => (
                    <div
                      key={`lecture-${i}-${j}`}
                      className="flex justify-between items-center ml-4"
                    >
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          )}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="flex flex-wrap gap-4 mt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-40" /> 
          {[1, 2].map(
            (
              i 
            ) => (
              <Card key={`review-${i}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            )
          )}
          <Skeleton className="h-10 w-40 mx-auto" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(
              (
                i 
              ) => (
                <Card key={`related-${i}`} className="overflow-hidden">
                  <Skeleton className="w-full h-36 bg-gray-200 dark:bg-neutral-700" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
