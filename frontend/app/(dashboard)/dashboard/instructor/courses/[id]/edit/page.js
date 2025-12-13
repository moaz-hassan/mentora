"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseDetailsForm } from "@/components/instructor/create-course/CourseDetailsForm";
import { CoursePreview } from "@/components/instructor/create-course/CoursePreview";
import {
  EditCourseHeader,
  UnsavedChangesWarning,
  EditCourseActions,
  EditCourseStructure,
  VideoUploadProgress,
} from "@/components/instructor/edit-course";
import { useEditCourse, useVideoUpload, useCourseUpdates } from "@/hooks/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function EditCoursePage({ params }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState("details");

  // Fetch course data
  const { courseData, setCourseData, loading, error, refetch } = useEditCourse(courseId);
  const { uploadProgress, uploadVideo } = useVideoUpload();
  const {
    isSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    updateGeneralInfo,
    saveAllChanges,
  } = useCourseUpdates(courseId, uploadVideo, refetch);

  // Handler for updating general course info
  const handleUpdateGeneralInfo = async (updatedData) => {
    const updated = await updateGeneralInfo(courseData, updatedData);
    setCourseData({ ...courseData, ...updated });
  };

  // Handler for saving all changes
  const handleSaveAllChanges = async () => {
    await saveAllChanges(courseData);
  };

  // Handler for course data changes
  const handleCourseDataChange = (newData) => {
    setCourseData(newData);
    setHasUnsavedChanges(true);
  };

  // Loading state
  if (loading) {
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

  // Error state - show friendly message
  if (error || !courseData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Course Not Found Or Under Review
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {error || "The course you're looking for doesn't exist or you don't have permission to edit it."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/instructor/courses">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Button>
                </Link>
                <Button 
                  onClick={() => refetch()} 
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <EditCourseHeader courseTitle={courseData.title} />
      
      <UnsavedChangesWarning hasUnsavedChanges={hasUnsavedChanges} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="structure">Course Structure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <CourseDetailsForm
            courseData={courseData}
            setCourseData={handleCourseDataChange}
            onSave={handleUpdateGeneralInfo}
            isEditMode={true}
          />
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <EditCourseStructure
            courseData={courseData}
            setCourseData={handleCourseDataChange}
          />
          
          <EditCourseActions
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSaveAllChanges}
          />
        </TabsContent>

        <TabsContent value="preview">
          <CoursePreview courseData={courseData} />
        </TabsContent>
      </Tabs>

      <VideoUploadProgress
        isVisible={uploadProgress.isVisible}
        progress={uploadProgress.progress}
        fileName={uploadProgress.fileName}
        fileSize={uploadProgress.fileSize}
        currentFile={uploadProgress.currentFile}
        totalFiles={uploadProgress.totalFiles}
      />
    </div>
  );
}
