// components/skeletons/CoursePageSkeleton.jsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card"; // Assuming these are available

export default function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar Skeleton (if applicable, add if you have a global nav) */}
      <div className="w-full bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Skeleton className="h-6 w-32" /> {/* Logo */}
          <Skeleton className="h-8 w-64 rounded-full" /> {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-20" /> {/* Login */}
            <Skeleton className="h-10 w-20 rounded" /> {/* Sign Up Button */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* User Avatar */}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Course Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Breadcrumbs */}
            <Skeleton className="h-4 w-64" />
            {/* Course Title */}
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-6 w-full max-w-md" /> {/* Subtitle */}
            {/* Meta Info */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-20" /> {/* Instructor Name */}
              <Skeleton className="h-4 w-24" /> {/* Last Updated */}
              <Skeleton className="h-4 w-16" /> {/* Language */}
              <Skeleton className="h-4 w-20" /> {/* Students */}
            </div>
          </div>

          {/* Course Card on Right */}
          <Card className="md:col-span-1 p-0 overflow-hidden">
            <Skeleton className="w-full h-48 bg-gray-200" />{" "}
            {/* Video Thumbnail */}
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <Skeleton className="h-8 w-24" /> {/* Price */}
                <Skeleton className="h-4 w-20" /> {/* Old Price */}
              </div>
              <Skeleton className="h-10 w-full rounded" />{" "}
              {/* Add to Cart Button */}
              <Skeleton className="h-10 w-full rounded" />{" "}
              {/* Enroll Now Button */}
              <Skeleton className="h-4 w-full" /> {/* Money Back Guarantee */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" /> {/* Item 1 */}
                <Skeleton className="h-4 w-full" /> {/* Item 2 */}
                <Skeleton className="h-4 w-full" /> {/* Item 3 */}
                <Skeleton className="h-4 w-full" /> {/* Item 4 */}
                <Skeleton className="h-4 w-full" /> {/* Item 5 */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Curriculum Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" /> {/* Curriculum Title */}
          {[1, 2, 3].map(
            (
              i // Simulate a few sections
            ) => (
              <Card key={`section-${i}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/2" /> {/* Section Title */}
                    <Skeleton className="h-4 w-20" />{" "}
                    {/* Lecture count / Duration */}
                  </div>
                  {/* Simulate a few lectures within a section */}
                  {[1, 2].map((j) => (
                    <div
                      key={`lecture-${i}-${j}`}
                      className="flex justify-between items-center ml-4"
                    >
                      <Skeleton className="h-4 w-2/3" /> {/* Lecture Title */}
                      <Skeleton className="h-4 w-12" /> {/* Lecture Duration */}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* About the Instructor Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" /> {/* Instructor Title */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />{" "}
            {/* Instructor Avatar */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" /> {/* Instructor Name */}
              <Skeleton className="h-4 w-48" /> {/* Instructor Title */}
            </div>
          </div>
          <Skeleton className="h-20 w-full" /> {/* Instructor Bio */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Skeleton className="h-4 w-32" /> {/* Rating */}
            <Skeleton className="h-4 w-32" /> {/* Reviews */}
            <Skeleton className="h-4 w-32" /> {/* Students */}
            <Skeleton className="h-4 w-24" /> {/* Courses */}
          </div>
        </div>

        {/* Student Feedback Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" /> {/* Feedback Title */}
          {[1, 2].map(
            (
              i // Simulate a few reviews
            ) => (
              <Card key={`review-${i}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />{" "}
                    {/* Reviewer Avatar */}
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-24" /> {/* Reviewer Name */}
                      <Skeleton className="h-3 w-16" /> {/* Date */}
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24" /> {/* Star Rating */}
                  <Skeleton className="h-16 w-full" /> {/* Review Text */}
                </CardContent>
              </Card>
            )
          )}
          <Skeleton className="h-10 w-40 mx-auto" />{" "}
          {/* Show All Reviews Button */}
        </div>

        {/* Related Courses Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" /> {/* Related Courses Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(
              (
                i // Simulate 3 related course cards
              ) => (
                <Card key={`related-${i}`} className="overflow-hidden">
                  <Skeleton className="w-full h-36 bg-gray-200" />{" "}
                  {/* Course Thumbnail */}
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" /> {/* Course Title */}
                    <Skeleton className="h-4 w-1/2" /> {/* Instructor Name */}
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-12" /> {/* Rating */}
                      <Skeleton className="h-4 w-16" /> {/* Total Students */}
                    </div>
                    <Skeleton className="h-6 w-20" /> {/* Price */}
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
