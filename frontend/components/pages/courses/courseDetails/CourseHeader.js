import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, Globe } from "lucide-react";
import { getInstructorName, getInstructorInitials } from "@/lib/utils/courseUtils";

export default function CourseHeader({ course }) {
  const instructorName = getInstructorName(course.Instructor);
  const instructorInitials = getInstructorInitials(course.Instructor);

  return (
    <div className="mb-10 text-white">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/courses" className="hover:text-white transition-colors">
          {course.category_name || "Courses"}
        </Link>
        <span>/</span>
        <span className="text-gray-300 truncate max-w-[200px]">{course.title}</span>
      </nav>

      {/* Title & Badge */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Badge className="bg-blue-600 border-none text-white hover:bg-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          {course.category_name || "COURSE"}
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
          {course.title}
        </h1>
      </div>

      {/* Description (Smaller Size) */}
      <p className="text-base text-gray-300 mb-6 leading-relaxed max-w-3xl">
        {course.description}
      </p>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
        {course.average_rating ? (
          <div className="flex items-center gap-1 text-yellow-400 font-bold">
            <span className="text-lg">{course.average_rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(course.average_rating)
                      ? "fill-current"
                      : "text-gray-600 fill-gray-600"
                  }`}
                />
              ))}
            </div>
            <Link
              href="#reviews"
              className="text-blue-300 hover:text-blue-200 underline text-xs font-normal ml-1"
            >
              ({course.total_reviews?.toLocaleString() || 0} reviews)
            </Link>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">No ratings yet</span>
        )}

        <span className="text-gray-500">|</span>

        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{course.enrollments_count?.toLocaleString() || 0} students</span>
        </div>

        <span className="text-gray-500">|</span>

        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            Last updated{" "}
            {new Date(course.updated_at || course.created_at).toLocaleDateString(
              "en-US",
              { month: "short", year: "numeric" }
            )}
          </span>
        </div>
      </div>

      {/* Instructor Mini Profile */}
      <div className="flex items-center gap-3 text-sm">
        <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center overflow-hidden ring-2 ring-white/10">
          {course.Instructor?.Profile?.avatar_url ? (
            <img
              src={course.Instructor.Profile.avatar_url}
              alt={instructorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-bold">{instructorInitials}</span>
          )}
        </div>
        <div>
          <p className="text-gray-400 text-xs">Created by</p>
          <p className="font-medium text-white hover:text-blue-300 cursor-pointer">
            {instructorName}
          </p>
        </div>
        <div className="flex items-center gap-1.5 ml-4 text-gray-300">
          <Globe className="w-3.5 h-3.5" />
          <span className="text-xs">English</span>
        </div>
      </div>
    </div>
  );
}
