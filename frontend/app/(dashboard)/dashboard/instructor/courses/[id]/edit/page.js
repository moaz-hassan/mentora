"use client";

import { use, useState } from "react";
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

export default function EditCoursePage({ params }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState("details");

  
  const { courseData, setCourseData, loading, error, refetch } = useEditCourse(courseId);
  const { uploadProgress, uploadVideo } = useVideoUpload();
  const {
    isSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    updateGeneralInfo,
    saveAllChanges,
  } = useCourseUpdates(courseId, uploadVideo, refetch);

  
  const handleUpdateGeneralInfo = async (updatedData) => {
    const updated = await updateGeneralInfo(courseData, updatedData);
    setCourseData({ ...courseData, ...updated });
  };

  
  const handleSaveAllChanges = async () => {
    await saveAllChanges(courseData);
  };

  
  const handleCourseDataChange = (newData) => {
    setCourseData(newData);
    setHasUnsavedChanges(true);
  };

  
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

  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-xl mb-4">Error loading course</div>
            <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  
  if (!courseData) {
    return null;
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
