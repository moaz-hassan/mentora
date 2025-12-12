import getFeaturedCourses from "@/lib/apiCalls/courses/getFeaturedCourses.apiCall";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import CourseCardClient from "./CourseCardClient";

export default async function FeaturedCourses() {
  const { data } = await getFeaturedCourses();

  return (
    <section className="bg-white dark:bg-gray-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Featured Courses
          </h2>
          <Link
            href="/courses"
            className="text-primary hover:text-primary/80 font-medium flex items-center gap-2"
          >
            View All Courses
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-muted-foreground mb-8">
          Explore our most popular courses chosen by students
        </p>

        
        {data?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((course) => (
              <CourseCardClient key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No featured courses yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Check back soon for our handpicked courses
      </p>
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
      >
        Browse All Courses
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}




