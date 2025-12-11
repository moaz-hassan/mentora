"use client";

import Link from "next/link";
import { Star, Users, Clock, Award } from "lucide-react";

export default function CourseCard({ course }) {
  
  const getDiscountedPrice = () => {
    if (!course.have_discount) return null;
    if (course.discount_type === "percentage") {
      return course.price * (1 - course.discount_value / 100);
    }
    return course.price - course.discount_value;
  };

  const discountedPrice = getDiscountedPrice();
  const discountPercentage = course.have_discount && course.discount_type === "percentage" 
    ? course.discount_value 
    : course.have_discount 
      ? Math.round((course.discount_value / course.price) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col h-full"
    >
      {}
      <div className="relative h-44 overflow-hidden">
        <img
          src={course.thumbnail_url || "/images/defaults/course-placeholder.jpg"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {}
        {course.badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white rounded-md shadow-lg ${
              course.badge === "Bestseller"
                ? "bg-gradient-to-r from-orange-500 to-amber-500"
                : course.badge === "New"
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
          >
            {course.badge}
          </span>
        )}

        {}
        {course.have_discount && discountPercentage > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md shadow-lg">
            -{discountPercentage}%
          </span>
        )}

        {}
        <span className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded capitalize">
          {course.level}
        </span>
      </div>

      {}
      <div className="p-5 flex flex-col flex-1">
        {}
        <span className="text-xs font-medium text-blue-600 mb-2">
          {course.category}
        </span>

        {}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
          {course.title}
        </h3>

        {}
        <p className="text-sm text-gray-500 mb-3">
          by {course.instructor}
        </p>

        {}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-900">{course.rating?.toFixed(1) || "N/A"}</span>
            <span className="text-gray-400">({course.review_count || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{course.students?.toLocaleString() || 0}</span>
          </div>
        </div>

        {}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {course.price === 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-green-600">Free</span>
              <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full">
                Enroll Now
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ${discountedPrice ? discountedPrice.toFixed(2) : course.price?.toFixed(2)}
                </span>
                {discountedPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${course.price?.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
