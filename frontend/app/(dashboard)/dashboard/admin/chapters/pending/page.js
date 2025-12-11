"use client";

import { useState, useEffect } from "react";
import {
  FileCheck,
  BookOpen,
  User,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";

export default function PendingChaptersPage() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingChapters();
  }, []);

  const fetchPendingChapters = async () => {
    try {
      
      
      
      
      
      const groupedData = {
        "course-1": {
          course_id: "course-1",
          course_title: "Advanced React Patterns",
          instructor_name: "John Doe",
          chapters: [
            {
              id: "ch-1",
              title: "Advanced Hooks Patterns",
              description: "Deep dive into custom hooks and advanced patterns",
              order_number: 13,
              submitted_at: "2024-11-18T10:30:00Z",
              lessons_count: 5,
            },
            {
              id: "ch-2",
              title: "Performance Optimization",
              description: "Learn how to optimize React applications",
              order_number: 14,
              submitted_at: "2024-11-17T14:20:00Z",
              lessons_count: 4,
            },
          ],
        },
        "course-2": {
          course_id: "course-2",
          course_title: "Python for Data Science",
          instructor_name: "Jane Smith",
          chapters: [
            {
              id: "ch-3",
              title: "Advanced NumPy",
              description: "Advanced array operations and broadcasting",
              order_number: 11,
              submitted_at: "2024-11-16T09:15:00Z",
              lessons_count: 6,
            },
          ],
        },
      };

      setChapters(groupedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending chapters:", error);
      setLoading(false);
    }
  };

  const handleReviewClick = (chapter, courseInfo, action) => {
    setSelectedChapter({ ...chapter, courseInfo });
    setReviewAction(action);
    setShowReviewModal(true);
    setRejectionReason("");
  };

  const handleSubmitReview = async () => {
    if (reviewAction === "reject" && rejectionReason.trim().length < 10) {
      alert("Rejection reason must be at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      
      
      
      
      
      
      
      
      
      

      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      
      const updatedChapters = { ...chapters };
      const courseId = selectedChapter.courseInfo.course_id;
      updatedChapters[courseId].chapters = updatedChapters[courseId].chapters.filter(
        (ch) => ch.id !== selectedChapter.id
      );
      
      
      if (updatedChapters[courseId].chapters.length === 0) {
        delete updatedChapters[courseId];
      }
      
      setChapters(updatedChapters);
      setShowReviewModal(false);
      setSelectedChapter(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const totalPendingChapters = Object.values(chapters).reduce(
    (sum, course) => sum + course.chapters.length,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Chapters</h1>
          <p className="mt-2 text-gray-600">
            Review and approve new chapters added to existing courses
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {totalPendingChapters} Pending
          </span>
        </div>
      </div>

      {}
      {totalPendingChapters === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600">
            There are no pending chapters to review at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(chapters).map(([courseId, courseData]) => (
            <div
              key={courseId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {}
              <button
                onClick={() => toggleCourse(courseId)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {expandedCourse === courseId ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {courseData.course_title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Instructor: {courseData.instructor_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  <span>{courseData.chapters.length} pending chapter{courseData.chapters.length !== 1 ? 's' : ''}</span>
                </div>
              </button>

              {}
              {expandedCourse === courseId && (
                <div className="border-t border-gray-200 divide-y divide-gray-200">
                  {courseData.chapters.map((chapter) => (
                    <div key={chapter.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {chapter.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            {chapter.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {chapter.lessons_count} lessons
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(chapter.submitted_at)}
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              Order: {chapter.order_number}
                            </span>
                          </div>
                        </div>

                        {}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() =>
                              handleReviewClick(chapter, courseData, "approve")
                            }
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleReviewClick(chapter, courseData, "reject")
                            }
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {reviewAction === "approve" ? "Approve Chapter" : "Reject Chapter"}
            </h3>

            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Course:</strong> {selectedChapter?.courseInfo.course_title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Chapter:</strong> {selectedChapter?.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Instructor:</strong> {selectedChapter?.courseInfo.instructor_name}
              </p>
            </div>

            {reviewAction === "approve" ? (
              <p className="text-gray-700 mb-6">
                Are you sure you want to approve this chapter? It will be added to
                the course and visible to enrolled students.
              </p>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection (minimum 10 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {rejectionReason.length}/10 characters minimum
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  reviewAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
