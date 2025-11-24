"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  TrendingUp,
  PlayCircle,
  Star,
} from "lucide-react";

export default function StudentOverviewPage() {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificatesEarned: 0,
    totalLearningHours: 0,
  });

  const [recentCourses, setRecentCourses] = useState([]);
  const [continueLearn, setContinueLearn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      // Import API service
      const { getMyEnrollments } = await import(
        "@/lib/apiCalls/enrollments/enrollment.service"
      );

      // Fetch real enrollments
      const response = await getMyEnrollments();

      if (response.success) {
        const enrollments = response.data;
        
        // Calculate stats from enrollments
        const completed = enrollments.filter(
          (e) => e.progress?.completionPercentage === 100
        ).length;
        
        const totalHours = enrollments.reduce((sum, e) => {
          return sum + (e.progress?.totalWatchTime || 0) / 3600;
        }, 0);

        setStats({
          enrolledCourses: enrollments.length,
          completedCourses: completed,
          certificatesEarned: completed, // Assuming 1 cert per completed course
          totalLearningHours: Math.round(totalHours),
        });

        // Set recent courses
        setRecentCourses(
          enrollments.slice(0, 3).map((e) => ({
            id: e.course_id,
            title: e.Course?.title || "Course",
            thumbnail_url: e.Course?.thumbnail_url || "https://via.placeholder.com/300x169",
            instructor: "Instructor",
            progress: e.progress?.completionPercentage || 0,
            rating: 4.5,
          }))
        );

        // Set continue learning
        const lastAccessed = enrollments
          .filter((e) => e.progress?.lastAccessed)
          .sort(
            (a, b) =>
              new Date(b.progress.lastAccessed) - new Date(a.progress.lastAccessed)
          )[0];

        if (lastAccessed) {
          setContinueLearn({
            id: lastAccessed.course_id,
            title: lastAccessed.Course?.title || "Course",
            thumbnail_url: lastAccessed.Course?.thumbnail_url || "https://via.placeholder.com/300x169",
            instructor: "Instructor",
            progress: lastAccessed.progress?.completionPercentage || 0,
            lastLesson: "Continue where you left off",
            enrollmentId: lastAccessed.id,
          });
        }

        setLoading(false);
        return;
      }

      // Fallback to placeholder data
      setStats({
        enrolledCourses: 12,
        completedCourses: 5,
        certificatesEarned: 5,
        totalLearningHours: 48,
      });

      setContinueLearn({
        id: "1",
        title: "Advanced React Patterns",
        thumbnail_url: "https://via.placeholder.com/300x169",
        instructor: "John Doe",
        progress: 65,
        lastLesson: "Lesson 8: Custom Hooks",
        enrollmentId: "enroll-1",
      });

      setRecentCourses([
        {
          id: "1",
          title: "Advanced React Patterns",
          thumbnail_url: "https://via.placeholder.com/300x169",
          instructor: "John Doe",
          progress: 65,
          rating: 4.8,
        },
        {
          id: "2",
          title: "Node.js Masterclass",
          thumbnail_url: "https://via.placeholder.com/300x169",
          instructor: "Jane Smith",
          progress: 30,
          rating: 4.6,
        },
        {
          id: "3",
          title: "TypeScript Fundamentals",
          thumbnail_url: "https://via.placeholder.com/300x169",
          instructor: "Mike Johnson",
          progress: 100,
          rating: 4.9,
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Enrolled Courses",
      value: stats.enrolledCourses.toString(),
      icon: BookOpen,
      color: "blue",
      href: "/dashboard/student/my-courses",
    },
    {
      name: "Completed Courses",
      value: stats.completedCourses.toString(),
      icon: CheckCircle,
      color: "green",
      href: "/dashboard/student/my-courses?filter=completed",
    },
    {
      name: "Certificates Earned",
      value: stats.certificatesEarned.toString(),
      icon: Award,
      color: "purple",
      href: "/dashboard/student/certificates",
    },
    {
      name: "Learning Hours",
      value: `${stats.totalLearningHours}h`,
      icon: Clock,
      color: "orange",
      href: "/dashboard/student/my-courses",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      yellow: "bg-yellow-100 text-yellow-600",
    };
    return colors[color] || colors.blue;
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
        <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track your progress and continue your learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Continue Learning */}
      {continueLearn && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Continue Learning</h2>
            <PlayCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={continueLearn.thumbnail_url}
              alt={continueLearn.title}
              className="w-full md:w-48 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{continueLearn.title}</h3>
              <p className="text-blue-100 text-sm mb-3">
                by {continueLearn.instructor}
              </p>
              <p className="text-sm mb-3">Last watched: {continueLearn.lastLesson}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{continueLearn.progress}% Complete</span>
                </div>
                <div className="w-full bg-blue-400 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${continueLearn.progress}%` }}
                  ></div>
                </div>
              </div>
              <Link
                href={`/enroll/${continueLearn.enrollmentId}/${continueLearn.id}`}
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Resume Learning
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          <Link
            href="/dashboard/student/my-courses"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                {course.progress === 100 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3">by {course.instructor}</p>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{course.progress}% Complete</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      {course.rating}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 rounded-full h-1.5 transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <Link
                  href={`/enroll/enroll-${course.id}/${course.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {course.progress === 100 ? "Review Course" : "Continue Learning"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/courses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              Browse Courses
            </span>
          </Link>
          <Link
            href="/dashboard/student/certificates"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Award className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">
              My Certificates
            </span>
          </Link>
          <Link
            href="/dashboard/student/messages"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5 text-green-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              Messages
            </span>
          </Link>
          <Link
            href="/dashboard/student/settings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5 text-orange-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              Settings
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
