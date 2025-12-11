import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorCoursesSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" /> {}
          <Skeleton className="h-4 w-64" /> {}
        </div>
        <Skeleton className="h-10 w-40" /> {}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" /> {}
                <Skeleton className="h-8 w-12" /> {}
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" /> {}
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" /> {}
            <Skeleton className="h-10 w-32" /> {}
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {}
                <Skeleton className="w-full md:w-48 h-32 rounded-lg flex-shrink-0" />

                {}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-full max-w-md space-y-2">
                      <Skeleton className="h-6 w-3/4" /> {}
                      <Skeleton className="h-4 w-full" /> {}
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />{" "}
                    {}
                  </div>

                  {}
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>

                  {}
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
