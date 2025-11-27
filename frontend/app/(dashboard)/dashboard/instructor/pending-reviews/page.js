"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { getAllInstructorCourses } from "@/lib/apiCalls/instructor/getAllInstructorCourses.apiCall";

export default function PendingReviewsPage() {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all instructor courses
      const response = await getAllInstructorCourses();
      const allCourses = response.data;

      // Filter for pending and under_review courses
      const pending = allCourses.filter(
        (course) => 
          course.status === "pending" || 
          course.status === "pending_review" || 
          course.status === "under_review"
      );

      setPendingCourses(pending);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      setError("Failed to load pending courses. Please try again.");
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-200",
        label: "Pending Review",
        description: "Your course is in the queue for admin review",
      },
      pending_review: {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-200",
        label: "Pending Review",
        description: "Your course is in the queue for admin review",
      },
      under_review: {
        icon: AlertCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-200",
        label: "Under Review",
        description: "An admin is currently reviewing your course",
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeSinceSubmission = (dateString) => {
    if (!dateString) return "Unknown";
    
    const submissionDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - submissionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button
            onClick={fetchPendingCourses}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Reviews</h1>
          <p className="mt-2 text-gray-600">
            Track the status of your courses awaiting admin approval
          </p>
        </div>
        <button
          onClick={fetchPendingCourses}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Review Process</p>
            <p className="text-sm text-blue-800 mt-1">
              Our admin team reviews all courses to ensure quality standards. This typically takes 2-5 business days.
              You'll receive an email notification once your course is reviewed.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {pendingCourses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Courses Pending Review
          </h2>
          <p className="text-gray-600 mb-6">
            All your courses have been reviewed. Create a new course to get started!
          </p>
          <a
            href="/dashboard/instructor/create-course"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Course
          </a>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pending</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingCourses.length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Under Review</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingCourses.filter((c) => c.status === "under_review").length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Queue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingCourses.filter((c) => c.status === "pending" || c.status === "pending_review").length}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Courses List */}
          <div className="space-y-4">
            {pendingCourses.map((course) => {
              const statusConfig = getStatusConfig(course.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-lg border ${statusConfig.borderColor} p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-6">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={course.thumbnail_url || "https://via.placeholder.com/300x169"}
                        alt={course.title}
                        className="w-48 h-28 object-cover rounded-lg"
                      />
                    </div>

                    {/* Course Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {course.title}
                          </h3>
                          {course.subtitle && (
                            <p className="text-sm text-gray-600 mb-2">
                              {course.subtitle}
                            </p>
                          )}
                        </div>
                        <div className={`flex items-center px-3 py-1 ${statusConfig.bgColor} rounded-full`}>
                          <StatusIcon className={`w-4 h-4 ${statusConfig.color} mr-2`} />
                          <span className={`text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {course.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Category</p>
                          <p className="text-sm font-medium text-gray-900">
                            {course.Category.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Level</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {course.level || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price</p>
                          <p className="text-sm font-medium text-gray-900">
                            ${course.price || "0"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Submitted</p>
                          <p className="text-sm font-medium text-gray-900">
                            {getTimeSinceSubmission(course.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Status Description */}
                      <div className={`flex items-start p-3 ${statusConfig.bgColor} rounded-lg`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color} mr-2 mt-0.5`} />
                        <div className="flex-1">
                          <p className={`text-sm ${statusConfig.color}`}>
                            {statusConfig.description}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Submitted on {formatDate(course.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          What happens during review?
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-semibold text-blue-600">1</span>
            </div>
            <p>
              <strong>Content Review:</strong> Our team checks your course content for quality,
              accuracy, and compliance with our guidelines.
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-semibold text-blue-600">2</span>
            </div>
            <p>
              <strong>Technical Check:</strong> We verify that all videos, materials, and quizzes
              are properly uploaded and functional.
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-semibold text-blue-600">3</span>
            </div>
            <p>
              <strong>Final Decision:</strong> Your course will be approved, or you'll receive
              feedback on required changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
