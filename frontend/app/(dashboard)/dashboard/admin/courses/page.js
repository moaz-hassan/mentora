"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import {
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  BookOpen,
  Search,
  Filter,
  MoreVertical,
  Trash2,
} from "lucide-react";

export default function CoursesManagementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [search, setSearch] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Get token from cookies (authToken) or fallback to localStorage
  const getToken = () => {
    const cookieToken = Cookies.get("authToken");
    if (cookieToken) return cookieToken;
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `${API_URL}/api/courses`;
      
      if (activeTab === "pending") {
        url = `${API_URL}/api/admin/courses/pending`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
      } else {
        // If API fails (e.g. not implemented yet), use empty array or mock
        setCourses([]);
        if (activeTab === "pending") {
           // Fallback to mock data for pending if API fails (as per previous file)
           // Keeping it empty for now to encourage API usage, or could restore mock.
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/courses/${courseId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Course approved successfully");
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setShowModal(false);
        setSelectedCourse(null);
      } else {
        toast.error(data.message || "Failed to approve course");
      }
    } catch (error) {
      console.error("Error approving course:", error);
      toast.error("Failed to approve course");
    }
  };

  const handleReject = async (courseId) => {
    if (rejectionReason.length < 10) {
      toast.error("Rejection reason must be at least 10 characters");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/courses/${courseId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Course rejected");
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setShowModal(false);
        setSelectedCourse(null);
        setRejectionReason("");
      } else {
        toast.error(data.message || "Failed to reject course");
      }
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast.error("Failed to reject course");
    }
  };

  const handleDelete = async (courseId) => {
      if(!confirm("Are you sure you want to delete this course?")) return;
      
      try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        
        if(data.success) {
            toast.success("Course deleted successfully");
            setCourses((prev) => prev.filter((c) => c.id !== courseId));
        } else {
            toast.error(data.message || "Failed to delete course");
        }
      } catch (error) {
          console.error("Error deleting course:", error);
          toast.error("Failed to delete course");
      }
  }

  const openModal = (course, actionType) => {
    setSelectedCourse(course);
    setAction(actionType);
    setShowModal(true);
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.instructor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <p className="mt-2 text-gray-600">Review pending courses and manage existing ones.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Courses
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600">
            {activeTab === "pending" 
              ? "There are no courses pending review." 
              : "No courses match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={course.thumbnail_url || "https://via.placeholder.com/300x169"}
                  alt={course.title}
                  className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        by {course.instructor?.name || "Unknown Instructor"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                       {activeTab === "all" && (
                           <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                               course.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                           }`}>
                               {course.is_published ? "Published" : "Draft"}
                           </span>
                       )}
                       {activeTab === "pending" && (
                           <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                               Pending Review
                           </span>
                       )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                  
                  {/* AI Analysis Section */}
                  {activeTab === "pending" && (
                    <div className="mb-4">
                      {course.ai_analysis ? (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-purple-100 rounded">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-purple-900">AI Insight</span>
                            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                              course.ai_analysis.suggested_decision === "approve" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              Suggestion: {course.ai_analysis.suggested_decision?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-purple-800 mb-2">{course.ai_analysis.summary}</p>
                          <div className="text-xs text-purple-700">
                            <span className="font-medium">Reasoning:</span> {course.ai_analysis.reasoning}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const btn = e.currentTarget;
                            const originalText = btn.innerText;
                            btn.innerText = "Analyzing...";
                            btn.disabled = true;
                            
                            try {
                              const token = getToken();
                              const res = await fetch(`${API_URL}/api/admin/courses/${course.id}/analyze`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              const data = await res.json();
                              if (data.success) {
                                setCourses(prev => prev.map(c => c.id === course.id ? { ...c, ai_analysis: data.data } : c));
                                toast.success("AI Analysis generated");
                              } else {
                                toast.error("Failed to generate analysis");
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error("Error generating analysis");
                            } finally {
                              btn.innerText = originalText;
                              btn.disabled = false;
                            }
                          }}
                          className="flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Analyze with AI
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.chapters_count || 0} chapters
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {course.level}
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">${course.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => window.open(`/courses/${course.id}`, "_blank")}
                      className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                    
                    {activeTab === "pending" && (
                      <>
                        <button
                          onClick={() => openModal(course, "approve")}
                          className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(course, "reject")}
                          className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {activeTab === "all" && (
                        <button 
                            onClick={() => handleDelete(course.id)}
                            className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm ml-auto"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                    )}
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
