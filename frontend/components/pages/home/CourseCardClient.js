"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, Users, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  formatPrice,
  formatDuration,
  calculateTotalDuration,
  calculateTotalLessons,
  calculateAverageRating,
  formatEnrollmentCount,
  getInstructorName,
} from "@/lib/utils/courseUtils";

export default function CourseCardClient({ course }) {
  const [imageError, setImageError] = useState(false);

  const {
    id,
    title,
    price,
    thumbnail_url,
    level,
    badge,
    is_featured,
    enrollments_count,
    Instructor,
    Chapters,
    Category,
    Ratings,
  } = course;

  const instructorName = getInstructorName(Instructor);
  const totalDuration = calculateTotalDuration(Chapters);
  const formattedDuration =
    totalDuration > 0 ? formatDuration(totalDuration) : "Duration TBD";
  const totalLessons = calculateTotalLessons(Chapters);
  const averageRating = calculateAverageRating(Ratings);
  const formattedPrice = formatPrice(price);
  const formattedEnrollments = formatEnrollmentCount(enrollments_count);
  const categoryName = Category?.name || "Course";

  const levelColors = {
    beginner: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    intermediate: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    advanced: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
  };

  return (
    <Link href={`/courses/${id}`}>
      <Card className="overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="relative h-48 w-full">
          {!imageError ? (
            <Image
              src={thumbnail_url}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">{categoryName}</span>
            </div>
          )}

          {}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {level && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  levelColors[level] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-3 pt-1">
          {categoryName && (
            <div className="bg-neutral-200 dark:bg-gray-700 w-fit px-3 py-1 mb-2 rounded-full text-xs font-medium text-gray-800 dark:text-gray-200">
              {categoryName}
            </div>
          )}
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{instructorName}</p>

          {}
          <div className="flex items-center gap-2 mb-3">
            {averageRating !== null ? (
              <>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({Ratings.length}{" "}
                  {Ratings.length === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                New
              </span>
            )}
          </div>

          {}
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formattedDuration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>
                {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
              </span>
            </div>
          </div>

          {}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <Users className="w-4 h-4" />
            <span>{formattedEnrollments}</span>
          </div>

          {}
          <div className="flex items-center justify-between">
            <span
              className={`text-xl font-bold ${
                formattedPrice === "Free" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
              }`}
            >
              {formattedPrice}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

