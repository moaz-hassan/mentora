"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Clock,
  CheckCircle,
  PlayCircle,
  Filter,
  Search,
} from "lucide-react";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMyCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [filter, searchQuery, courses]);

  const fetchMyCourses = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/enrollments');
      // const data = await response.json();

      const mockCourses = [
        {
          id: "1",
          enrollmentId: "enroll-1",
          title: "Advanced React Patterns",
          thumbnail_url: "https://via.placeholder.com/300x169",
          instructor: "John Doe",
          progress: 65,
          rating: 4.8,
          totalLessons: 45,
          completedLessons: 29,
          lastAccessed: "2024-11-18",
          enrolled_at: "2024-10-01",
        },
        {
          id: "2",
          enrollmentId: "enroll-2",
          title: "Node.js Masterclass",
          thumbnail_url: "https://via.placeholder.com/300x169",
          instructor: "Jane Smith",
          progress: 30,
          rating: 4.6,
          totalLessons: 60,
          completedLessons: 18,
          lastAccessed: "2024-11-15",
          enrolled_at: "2024-09-15",
        },
        {
          id: "3",
          enrollmentId: "enroll-3",
          title: "TypeScript Fundamentals",
          thumbnail_url: "https://via.placeholder.com/300x169",
          instructor: "Mike Johnson",
          progress: 100,
          rating: 4.9,
          totalLessons: 30,
          completedLessons: 30,
          lastAccessed: "2024-11-10",
          enrolled_at: "2024-08-20",
        },
        {
          id: "4",
          enrollmentId: "enroll-4",
          title: "Python for Data Science",
          thumbnail_url: "https://via.placeholder.com/300x169",
          instructor: "Sarah Williams",
          progress: 0,
          rating: 4.7,
          totalLessons: 50,
          completedLessons: 0,
          lastAccessed: null,
          enrolled_at: "2024-11-18",
        },
      ];

      setCourses(mockCourses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Apply status filter
    if (filter === "in-progress") {
      filtered = filtered.filter((c) => c.progress > 0 && c.progress < 100);
    } else if (filter === "completed") {
      filtered = filtered.filter((c) => c.progress === 100);
    } else if (filter === "not-started") {
      filtered = filtered.filter((c) => c.progress === 0);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="mt-2 text-gray-600">
          {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "in-progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "not-started", label: "Not Started" },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Start learning by enrolling in a course"}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {course.progress === 100 && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </div>
                )}
                {course.progress > 0 && course.progress < 100 && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {course.progress}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    {course.rating}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.completedLessons}/{course.totalLessons} lessons
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{course.progress}% Complete</span>
                    {course.lastAccessed && (
                      <span>
                        Last accessed:{" "}
                        {new Date(course.lastAccessed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2 transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/enroll/${course.enrollmentId}/${course.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {course.progress === 0 ? (
                    <>
                      <PlayCircle className="w-4 h-4 inline mr-2" />
                      Start Course
                    </>
                  ) : course.progress === 100 ? (
                    "Review Course"
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 inline mr-2" />
                      Continue Learning
                    </>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
