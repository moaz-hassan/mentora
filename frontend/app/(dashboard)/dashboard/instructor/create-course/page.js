"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseDetailsForm } from "../../../../../components/instructorDashboard/create-course/CourseDetailsForm";
import { CourseStructureEditor } from "../../../../../components/instructorDashboard/create-course/CourseStructureEditor";
import { CoursePreview } from "../../../../../components/instructorDashboard/create-course/CoursePreview";
import { UploadProgressModal } from "../../../../../components/instructorDashboard/create-course/UploadProgressModal";
import useCourseStore from "@/store/courseStore";
import { toast } from "react-toastify";
import uploadCourseContent from "@/lib/apiCalls/courses/uploadCourseContent";
import courseSaveDraftApiCall from "@/lib/apiCalls/courses/courseSaveDraft.apiCall";
import { validateChapterRequirement, validateCourse } from "@/lib/validation/courseValidation";
export default function CreateCoursePage() {
  const [activeTab, setActiveTab] = useState("details");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const {
    courseData,
    initializeCourse,
    updateCourseData,
    setCourseData,
    saveDraft,
    publishCourse,
    clearDraft,
  } = useCourseStore();

  useEffect(() => {
    if (!courseData) {
      initializeCourse();
    }
  }, [courseData, initializeCourse]);

  if (!courseData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading course data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if course can be saved or submitted
  const canSaveOrSubmit = () => {
    const hasTitle = courseData?.title && courseData.title.trim() !== "";
    const hasDescription = courseData?.description && courseData.description.trim() !== "";
    const hasChapters = courseData?.chapters && courseData.chapters.length > 0;

    return hasTitle && hasDescription && hasChapters;
  };

  // Calculate course statistics
  const getCourseStats = () => {
    const chapters = courseData?.chapters || [];
    let lessonsCount = 0;
    let quizzesCount = 0;

    chapters.forEach((chapter) => {
      if (chapter.items) {
        chapter.items.forEach((item) => {
          if (item.type === "lesson") lessonsCount++;
          if (item.type === "quiz") quizzesCount++;
        });
      }
    });

    return {
      chaptersCount: chapters.length,
      lessonsCount,
      quizzesCount,
    };
  };

  const handleSaveDraft = async () => {
    // Validate chapter requirement
    const chapterError = validateChapterRequirement(courseData?.chapters);
    if (chapterError) {
      toast.error(chapterError);
      return;
    }

    // Validate course data
    const validationErrors = validateCourse(courseData);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setIsUploading(true);
    setUploadProgress({ status: "uploading", message: "Saving as draft..." });

    try {
      const { courseId } = await uploadCourseContent(courseData, (progress) => {
        setUploadProgress(progress);
      });

      // Save as draft
      if (courseId) {
        try {
          await courseSaveDraftApiCall(courseId);
        } catch (error) {
          toast.error(error.message || "Failed to save course as draft");
        }
      }

      // Clear store state after successful upload
      clearDraft();

      // Get course statistics
      const stats = getCourseStats();

      setUploadProgress({
        status: "success",
        message: "Course saved as draft successfully!",
        details: {
          courseTitle: courseData.title,
          chaptersCount: stats.chaptersCount,
          lessonsCount: stats.lessonsCount,
          quizzesCount: stats.quizzesCount,
          status: "Draft",
        },
      });

      // Success - redirect after a short delay
      // setTimeout(() => {
      //   window.location.href = "/dashboard/instructor/courses";
      // }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress({
        status: "error",
        message: error.message || "Upload failed",
      });

      // Close modal after error
      setTimeout(() => {
        setIsUploading(false);
      }, 3000);
    }
  };

  const handleSubmitForReview = async () => {
    // Validate chapter requirement
    const chapterError = validateChapterRequirement(courseData?.chapters);
    if (chapterError) {
      toast.error(chapterError);
      return;
    }

    // Validate course data
    const validationErrors = validateCourse(courseData);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to submit this course for review? You won't be able to edit it until the review is complete."
      )
    ) {
      return;
    }

    // Start the upload process
    setIsUploading(true);
    setUploadProgress({
      status: "uploading",
      message: "Submitting for review...",
    });

    try {
      const { courseId } = await uploadCourseContent(courseData, (progress) => {
        setUploadProgress(progress);
      });

      // Submit for review
      if (courseId) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/submit-review`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit for review");
        }
      }

      // Clear store state after successful upload
      clearDraft();

      // Get course statistics
      const stats = getCourseStats();

      setUploadProgress({
        status: "success",
        message: "Course submitted for review successfully!",
        details: {
          courseTitle: courseData.title,
          chaptersCount: stats.chaptersCount,
          lessonsCount: stats.lessonsCount,
          quizzesCount: stats.quizzesCount,
          status: "Pending Review",
        },
      });

      // Success - redirect after a short delay
      // setTimeout(() => {
      //   window.location.href = "/dashboard/instructor/courses";
      // }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress({
        status: "error",
        message: error.message || "Upload failed",
      });

      // Close modal after error
      setTimeout(() => {
        setIsUploading(false);
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          Create New Course
        </h1>
        <p className="text-neutral-600 mt-2">
          Fill in the details below to create your new course
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="preview" disabled={!courseData?.title}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <CourseDetailsForm
            courseData={courseData}
            setCourseData={setCourseData}
          />

          <CourseStructureEditor
            courseData={courseData}
            setCourseData={setCourseData}
          />

          <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              disabled={!courseData?.title}
              className={`px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50 ${
                !courseData?.title ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Preview Course
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={!canSaveOrSubmit()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                !canSaveOrSubmit()
                  ? "bg-neutral-300 cursor-not-allowed"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
              title={
                !courseData?.chapters || courseData.chapters.length === 0
                  ? "At least one chapter is required"
                  : !courseData?.title
                  ? "Course title is required"
                  : !courseData?.description
                  ? "Course description is required"
                  : ""
              }
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={
                !canSaveOrSubmit() || !courseData?.introVideoFile
              }
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                !canSaveOrSubmit() || !courseData?.introVideoFile
                  ? "bg-neutral-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              title={
                !courseData?.chapters || courseData.chapters.length === 0
                  ? "At least one chapter is required"
                  : !courseData?.title
                  ? "Course title is required"
                  : !courseData?.description
                  ? "Course description is required"
                  : !courseData?.introVideoFile
                  ? "Please upload an introduction video to submit for review"
                  : ""
              }
            >
              Send for Review
            </button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Edit
            </button>
          </div>
          <CoursePreview courseData={courseData} />

          <div className="flex justify-start gap-4 pt-6 mt-8 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
            >
              Keep Editing
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <UploadProgressModal isOpen={isUploading} progress={uploadProgress} />
    </div>
  );
}
