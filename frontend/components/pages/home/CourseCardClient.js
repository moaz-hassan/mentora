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
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <Link href={`/courses/${id}`}>
      <Card className="overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
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
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-sm text-gray-500">{categoryName}</span>
            </div>
          )}

          {}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {level && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  levelColors[level] || "bg-gray-100 text-gray-800"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-3 pt-1">
          {categoryName && (
            <div className=" bg-neutral-200 w-fit px-3 py-1 mb-2 rounded-full text-xs font-medium">
              {categoryName}
            </div>
          )}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{instructorName}</p>

          {}
          <div className="flex items-center gap-2 mb-3">
            {averageRating !== null ? (
              <>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-sm font-semibold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({Ratings.length}{" "}
                  {Ratings.length === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                New
              </span>
            )}
          </div>

          {}
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
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
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
            <Users className="w-4 h-4" />
            <span>{formattedEnrollments}</span>
          </div>

          {}
          <div className="flex items-center justify-between">
            <span
              className={`text-xl font-bold ${
                formattedPrice === "Free" ? "text-green-600" : "text-gray-900"
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
