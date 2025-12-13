"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, BookOpen } from "lucide-react";
import {
  getAdminCourses,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  deleteCourse,
  getCourseDetails,
  toggleFeatured,
} from "@/lib/apiCalls/admin/courses.apiCall";
import { AdminCourseView } from "@/components/admin/courses/AdminCourseView";
import { AdminCourseCard } from "@/components/admin/courses/AdminCourseCard";
import { CourseApprovalDialog } from "@/components/admin/courses/CourseApprovalDialog";

export default function CoursesManagementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [viewMode, setViewMode] = useState("list");
  const [previewCourse, setPreviewCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = activeTab === "pending"
        ? await getPendingCourses()
        : await getAdminCourses();

      if (result.success) {
        setCourses(result.data.data || result.data || []);
      } else {
        toast.error(result.error || "Failed to fetch courses");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      const result = await approveCourse(courseId);
      if (result.success) {
        toast.success(result.message || "Course approved successfully");
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setShowModal(false);
        setSelectedCourse(null);
        if (viewMode === "preview") setViewMode("list");
      } else {
        toast.error(result.error || "Failed to approve course");
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
      const result = await rejectCourse(courseId, rejectionReason);
      if (result.success) {
        toast.success(result.message || "Course rejected");
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setShowModal(false);
        setSelectedCourse(null);
        setRejectionReason("");
        if (viewMode === "preview") setViewMode("list");
      } else {
        toast.error(result.error || "Failed to reject course");
      }
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast.error("Failed to reject course");
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const result = await deleteCourse(courseId);
      if (result.success) {
        toast.success(result.message || "Course deleted successfully");
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      } else {
        toast.error(result.error || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const handlePreview = async (courseId) => {
    setLoading(true);
    try {
      const result = await getCourseDetails(courseId);
      if (result.success) {
        setPreviewCourse(result.data.data || result.data);
        setViewMode("preview");
      } else {
        toast.error(result.error || "Failed to load course details");
      }
    } catch (error) {
      console.error("Error loading course details:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (course, actionType) => {
    setSelectedCourse(course);
    setAction(actionType);
    setShowModal(true);
  };

  const handleModalClose = (open) => {
    if (!open) {
      setShowModal(false);
      setSelectedCourse(null);
      setRejectionReason("");
    }
  };

  const handleAIAnalysisComplete = (courseId, analysisData) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ai_analysis: analysisData } : c))
    );
  };

  const handleToggleFeatured = async (courseId, isFeatured) => {
    try {
      const result = await toggleFeatured(courseId);
      if (result.success) {
        toast.success(result.message || (isFeatured ? "Course marked as featured" : "Course removed from featured"));
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, is_featured: isFeatured } : c))
        );
      } else {
        toast.error(result.error || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Failed to update featured status");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Preview Mode
  if (viewMode === "preview" && previewCourse) {
    return (
      <>
        <AdminCourseView
          course={previewCourse}
          onClose={() => setViewMode("list")}
          onApprove={(c) => openModal(c, "approve")}
          onReject={(c) => openModal(c, "reject")}
        />

        <CourseApprovalDialog
          open={showModal}
          onOpenChange={handleModalClose}
          course={selectedCourse}
          action={action}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Course Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-neutral-400">
          Review pending courses and manage existing ones.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-neutral-800 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`${
              activeTab === "all"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Courses
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-8 sm:p-12 text-center">
          <BookOpen className="w-12 sm:w-16 h-12 sm:h-16 mx-auto text-gray-400 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Courses Found
          </h3>
          <p className="text-gray-600 dark:text-neutral-400">
            {activeTab === "pending"
              ? "There are no courses pending review."
              : "No courses match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              activeTab={activeTab}
              onPreview={handlePreview}
              onApprove={(c) => openModal(c, "approve")}
              onReject={(c) => openModal(c, "reject")}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
              onAIAnalysisComplete={handleAIAnalysisComplete}
            />
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <CourseApprovalDialog
        open={showModal}
        onOpenChange={handleModalClose}
        course={selectedCourse}
        action={action}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
