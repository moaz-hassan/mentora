"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CourseDetailsForm,
  CourseStructureEditor,
  CoursePreview,
  UploadProgressModal,
  CreateCourseHeader,
  CreateCourseActions,
} from "@/components/instructor/create-course";
import useCourseStore from "@/store/courseStore";
import { toast } from "sonner";
import {
  useCreateCourse,
  useCourseValidation,
  useCourseStats,
} from "@/hooks/course";

export default function CreateCoursePage() {
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const {
    courseData,
    initializeCourse,
    setCourseData,
    clearDraft,
  } = useCourseStore();

  
  const { isUploading, uploadProgress, saveDraft, submitForReview } =
    useCreateCourse(clearDraft);
  const { canSaveOrSubmit, validateChapters, validateFullCourse, getValidationMessage } =
    useCourseValidation(courseData);

  useEffect(() => {
    if (!courseData) {
      initializeCourse();
    }
  }, [courseData, initializeCourse]);

  
  const handleSaveDraft = async () => {
    if (!validateChapters()) {
      toast.error(getValidationMessage);
      return;
    }

    if (!validateFullCourse()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    await saveDraft(courseData);
  };

  
  const handleSubmitForReview = async () => {
    if (!validateChapters()) {
      toast.error(getValidationMessage);
      return;
    }

    if (!validateFullCourse()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    setIsSubmitDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    await submitForReview(courseData);
    setIsSubmitDialogOpen(false);
  };

  
  if (!courseData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading course data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CreateCourseHeader />

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

          <CreateCourseActions
            canSave={canSaveOrSubmit}
            canSubmit={canSaveOrSubmit && courseData?.introVideoFile}
            validationMessage={getValidationMessage}
            onSaveDraft={handleSaveDraft}
            onSubmitForReview={handleSubmitForReview}
            onPreview={() => setActiveTab("preview")}
          />
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

          <div className="flex justify-start gap-4 pt-6 mt-8 border-t border-neutral-200 dark:border-neutral-800">
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

      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit this course for review?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't be able to edit it until the review is complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
