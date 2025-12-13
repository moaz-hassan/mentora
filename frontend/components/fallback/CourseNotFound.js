import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseNotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-50 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-gray-100 dark:border-neutral-700">
            <FileQuestion className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Not Found</h1>
          <p className="text-gray-600 dark:text-neutral-400 text-lg">
            We couldn't find the course you're looking for. It might have been
            removed, renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/courses">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Courses
            </Button>
          </Link>

          <Link href="/">
            <Button size="lg" variant="outline" className="min-w-[160px]">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Suggestions Card */}
        <Card className="mt-8 border-dashed dark:bg-neutral-800 dark:border-neutral-700">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-300 uppercase tracking-wider mb-4">
              Or try one of these
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/courses?category=design">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer text-sm font-medium text-gray-700 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-400">
                  Web Design
                </div>
              </Link>
              <Link href="/courses?category=development">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer text-sm font-medium text-gray-700 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-400">
                  Development
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

