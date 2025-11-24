"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  BookOpen,
  Clock,
} from "lucide-react";

export default function PendingCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/courses/pending');
      // const data = await response.json();

      const mockCourses = [
        {
          id: "1",
          title: "Advanced React Patterns",
          description: "Learn advanced React patterns and best practices...",
          instructor: {
            id: "inst-1",
            name: "John Doe",
            email: "john@example.com",
          },
          category: "Web Development",
          level: "advanced",
          price: 49.99,
          thumbnail_url: "https://via.placeholder.com/300x169",
          submitted_for_review_at: new Date(Date.now() - 86400000).toISOString(),
          chapters_count: 8,
          lessons_count: 45,
        },
        {
          id: "2",
          title: "Python for Data Science",
          description: "Complete guide to data science with Python...",
          instructor: {
            id: "inst-2",
            name: "Jane Smith",
            email: "jane@example.com",
          },
          category: "Data Science",
          level: "intermediate",
          price: 59.99,
          thumbnail_url: "https://via.placeholder.com/300x169",
          submitted_for_review_at: new Date(Date.now() - 172800000).toISOString(),
          chapters_count: 10,
          lessons_count: 60,
        },
      ];

      setCourses(mockCourses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      // TODO: API call to approve course
      // await fetch(`/api/admin/courses/${courseId}/approve`, { method: 'POST' });

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setShowModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error approving course:", error);
    }
  };

  const handleReject = async (courseId) => {
    if (rejectionReason.length < 10) {
      alert("Rejection reason must be at least 10 characters");
      return;
    }

    try {
      // TODO: API call to reject course
      // await fetch(`/api/admin/courses/${courseId}/reject`, {
      //   method: 'POST',
      //   body: JSON.stringify({ rejection_reason: rejectionReason })
      // });

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setShowModal(false);
      setSelectedCourse(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting course:", error);
    }
  };

  const openModal = (course, actionType) => {
    setSelectedCourse(course);
    setAction(actionType);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <h1 className="text-3xl font-bold text-gray-900">Pending Courses</h1>
        <p className="mt-2 text-gray-600">
          {courses.length} course{courses.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600">
            There are no courses pending review at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-6">
                {/* Thumbnail */}
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-3">
                        {course.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full whitespace-nowrap ml-4">
                      Pending Review
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {course.instructor.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {course.chapters_count} chapters, {course.lessons_count} lessons
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(course.submitted_for_review_at)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-semibold">${course.price}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => window.open(`/courses/${course.id}`, "_blank")}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Course
                    </button>
                    <button
                      onClick={() => openModal(course, "approve")}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => openModal(course, "reject")}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {action === "approve" ? "Approve Course" : "Reject Course"}
            </h3>

            <p className="text-gray-600 mb-4">
              {action === "approve"
                ? `Are you sure you want to approve "${selectedCourse.title}"? This will make it available to students.`
                : `Are you sure you want to reject "${selectedCourse.title}"? Please provide a reason.`}
            </p>

            {action === "reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (minimum 10 characters)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this course is being rejected..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {rejectionReason.length}/10 characters
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCourse(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  action === "approve"
                    ? handleApprove(selectedCourse.id)
                    : handleReject(selectedCourse.id)
                }
                className={`px-4 py-2 rounded-lg text-white ${
                  action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
