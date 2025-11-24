"use client";

import { useEffect, useState, use } from "react";
import Cookies from "js-cookie";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CourseDetailsForm } from "../../../../../../../components/instructorDashboard/create-course/CourseDetailsForm";
import { EditCourseStructure } from "../../../../../../../components/instructorDashboard/edit-course/EditCourseStructure";
import { CoursePreview } from "../../../../../../../components/instructorDashboard/create-course/CoursePreview";
import { VideoUploadProgress } from "../../../../../../../components/instructorDashboard/edit-course/VideoUploadProgress";
import { getCourseForEdit } from "@/lib/apiCalls/courses/getCourseForEdit.apiCall";
import { updateCourseInfo } from "@/lib/apiCalls/courses/updateCourseInfo.apiCall";
import { createChapter } from "@/lib/apiCalls/chapters/createChapter";
import { createLesson } from "@/lib/apiCalls/lessons/createLesson";
import { createQuiz } from "@/lib/apiCalls/quizzes/createQuiz";
import { toast } from "react-toastify";
import { AlertCircle, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

export default function EditCoursePage({ params }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState({
    isVisible: false,
    progress: 0,
    fileName: '',
    fileSize: 0,
    currentFile: 0,
    totalFiles: 0,
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCourseForEdit(courseId);

      if (!response.success) {
        throw new Error(response.message || "Failed to load course");
      }

      // Transform backend data to match frontend structure
      const transformedData = {
        ...response.data,
        thumbnail: response.data.thumbnail_url,
        introVideoUrl: response.data.intro_video_url,
        chapters: response.data.Chapters
          ?.sort((a, b) => (a.order_number || 0) - (b.order_number || 0)) 
          .map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.description || "",
            order_number: chapter.order_number,
            items: [
              ...(chapter.Lessons?.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.lesson_type,
                videoUrl: lesson.video_url,
                textContent: lesson.content,
                duration: lesson.duration,
                isPreview: lesson.is_preview,
                order_number: lesson.order_number,
              })) || []),
              ...(chapter.Quizzes?.map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                questions_length: quiz.questions_length || 0,
                order_number: quiz.order_number,
              })) || []),
            ].sort((a, b) => (a.order_number || 0) - (b.order_number || 0)), // Sort items by order_number
          })) || [],
      };

      setCourseData(transformedData);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle updating general course information
  const handleUpdateGeneralInfo = async (updatedData) => {
    try {
      const response = await updateCourseInfo(courseId, {
        title: updatedData.title,
        subtitle: updatedData.subtitle,
        description: updatedData.description,
        category: updatedData.category,
        subcategory_id: updatedData.subcategory_id,
        level: updatedData.level,
        price: updatedData.price,
        learning_objectives: updatedData.learning_objectives,
        requirements: updatedData.requirements,
        target_audience: updatedData.target_audience,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update course");
      }

      toast.success("Course updated successfully!");
      
      // Update local state
      setCourseData({ ...courseData, ...response.data });
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // Handle saving all changes (chapters, lessons, quizzes)
  const handleSaveAllChanges = async () => {
    if (!hasUnsavedChanges) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    
    try {
      const token = Cookies.get("authToken");
      
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      const chapters = courseData?.chapters || [];
      
      // Separate existing and new chapters
      const existingChapters = chapters.filter(
        (ch) => ch.id && !ch.id.toString().startsWith("chapter-")
      );
      const newChapters = chapters.filter(
        (ch) => ch.id && ch.id.toString().startsWith("chapter-")
      );
      
      // Step 1: Process existing chapters - only add new items to them
      for (const chapter of existingChapters) {
        const newItems = (chapter.items || []).filter(
          (item) => item.id && (item.id.toString().startsWith("lesson-") || item.id.toString().startsWith("quiz-"))
        );
        
        if (newItems.length > 0) {
          for (const item of newItems) {
            await processItem(item, chapter.id, token);
          }
        }
      }
      
      // Step 2: Create new chapters with their items
      // Calculate the starting order number based on existing chapters count
      const existingChapterCount = existingChapters.length;
      
      for (let i = 0; i < newChapters.length; i++) {
        const chapter = newChapters[i];
        const chapterOrderNumber = existingChapterCount + i + 1;
        
        // Create the chapter
        const chapterResponse = await createChapter(
          {
            course_id: courseId,
            title: chapter.title,
            description: chapter.description || "",
            order_number: chapterOrderNumber,
          },
          token
        );

        if (!chapterResponse.success) {
          throw new Error(chapterResponse.message || `Failed to create chapter: ${chapter.title}`);
        }

        const newChapterId = chapterResponse.data.id;

        // Process all items in the new chapter
        if (chapter.items && chapter.items.length > 0) {
          for (const item of chapter.items) {
            await processItem(item, newChapterId, token);
          }
        }
      }

      toast.success("All changes saved successfully!");
      setHasUnsavedChanges(false);
      
      // Refresh course data to get updated state
      await fetchCourseData();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to process individual items (lessons/quizzes)
  const processItem = async (item, chapterId, token) => {
    // Check if it's a quiz (has questions property)
    if ("questions" in item) {
      // Validate quiz data
      if (!item.title || !item.title.trim()) {
        throw new Error("Quiz title is required");
      }
      
      if (!item.questions || item.questions.length === 0) {
        throw new Error(`Quiz "${item.title}" must have at least one question`);
      }
      
      // Filter out empty questions (questions with no text)
      const validQuestions = item.questions.filter(q => q.question && q.question.trim());
      
      if (validQuestions.length === 0) {
        throw new Error(`Quiz "${item.title}" has no valid questions. Please add at least one question with text.`);
      }
      
      // Validate each valid question
      for (let i = 0; i < validQuestions.length; i++) {
        const question = validQuestions[i];
        
        // Ensure options are in correct format for backend
        if (!question.options || question.options.length === 0) {
          throw new Error(`Question ${i + 1} in quiz "${item.title}" has no options`);
        }
        
        // Check if at least one option has text
        const hasValidOptions = Array.isArray(question.options) 
          ? question.options.some(opt => {
              const key = Object.keys(opt)[0];
              return opt[key] && opt[key].trim();
            })
          : false;
        
        if (!hasValidOptions) {
          throw new Error(`Question ${i + 1} in quiz "${item.title}" has no option text. Please fill in at least one option.`);
        }
        
        // Validate answer field
        if (!question.answer && !question.correctAnswer) {
          throw new Error(`Question ${i + 1} in quiz "${item.title}" has no correct answer selected`);
        }
      }
      
      // Transform questions to backend format (only valid questions)
      const transformedQuestions = validQuestions.map((q) => {
        // Ensure options are in array format (backend expects array)
        let options = q.options;
        
        // If options is an object, convert to array format
        if (!Array.isArray(options) && typeof options === 'object') {
          // Convert object format {a: "...", b: "..."} to array format [{a: "..."}, {b: "..."}]
          options = Object.entries(options).map(([key, value]) => ({ [key]: value }));
        }
        
        // If options is undefined or invalid, use default
        if (!options) {
          options = [
            { a: "" },
            { b: "" },
            { c: "" },
            { d: "" }
          ];
        }
        
        return {
          question: q.question,
          options: options, // Keep as array - backend expects array format
          answer: q.answer || q.correctAnswer, // Use 'answer' as primary, fallback to 'correctAnswer'
        };
      });
      
      const quizResponse = await createQuiz(
        {
          chapter_id: chapterId,
          title: item.title,
          questions: transformedQuestions,
        },
        token
      );

      if (!quizResponse.success) {
        throw new Error(quizResponse.message || `Failed to create quiz: ${item.title}`);
      }
    } 
    // It's a lesson
    else if (item.type === "video" || item.type === "text") {
      // Validate lesson data
      if (!item.title || !item.title.trim()) {
        throw new Error("Lesson title is required");
      }
      
      let videoUrl = null;
      let videoPublicId = null;
      let hlsUrl = null;
      let duration = item.duration || 0;
      
      // Handle video lessons
      if (item.type === "video") {
        // Check if there's an existing video URL (for existing lessons)
        if (item.videoUrl && !item.videoFile) {
          videoUrl = item.videoUrl;
          duration = item.duration || 0;
        }
        // Upload new video file
        else if (item.videoFile) {
          // Show upload progress overlay
          setUploadProgress({
            isVisible: true,
            progress: 0,
            fileName: item.title,
            fileSize: item.videoFile.size,
            currentFile: 0,
            totalFiles: 0,
          });
          
          const { uploadVideoToCloudinary } = await import(
            "@/lib/services/cloudinary.service"
          );
          
          const uploadResult = await uploadVideoToCloudinary(
            item.videoFile,
            (progressData) => {
              setUploadProgress(prev => ({
                ...prev,
                progress: progressData.progress || 0,
              }));
            }
          );
          
          videoUrl = uploadResult.secure_url;
          videoPublicId = uploadResult.public_id;
          hlsUrl = uploadResult.hls_url;
          duration = uploadResult.duration || 0;
          
          // Hide upload progress
          setUploadProgress({
            isVisible: false,
            progress: 0,
            fileName: '',
            fileSize: 0,
            currentFile: 0,
            totalFiles: 0,
          });
        } else {
          throw new Error(`Video lesson "${item.title}" requires a video file`);
        }
      }
      
      // Handle text lessons
      if (item.type === "text") {
        if (!item.textContent || !item.textContent.trim()) {
          throw new Error(`Text lesson "${item.title}" has no content`);
        }
      }
      
      // Create the lesson
      const lessonResponse = await createLesson(
        {
          chapter_id: chapterId,
          title: item.title,
          lesson_type: item.type,
          video_url: videoUrl,
          video_public_id: videoPublicId,
          hls_url: hlsUrl,
          content: item.textContent || "",
          duration: duration,
          is_preview: item.isPreview || false,
        },
        token
      );

      if (!lessonResponse.success) {
        throw new Error(lessonResponse.message || `Failed to create lesson: ${item.title}`);
      }
    }
  };

  // Loading state
  if (loading) {
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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Failed to Load Course
            </h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchCourseData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
              <Link
                href="/dashboard/instructor/courses"
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50"
              >
                Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Video Upload Progress Overlay */}
      <VideoUploadProgress
        isVisible={uploadProgress.isVisible}
        progress={uploadProgress.progress}
        fileName={uploadProgress.fileName}
        fileSize={uploadProgress.fileSize}
        currentFile={uploadProgress.currentFile}
        totalFiles={uploadProgress.totalFiles}
      />
      
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/instructor/courses"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900">Edit Course</h1>
        <p className="text-neutral-600 mt-2">
          Update your course information and add new content
        </p>
        
        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800 font-medium">
                You have unsaved changes. Don't forget to save your work!
              </span>
            </div>
            <Button
              onClick={() => setActiveTab("structure")}
              variant="outline"
              size="sm"
              className="bg-white"
            >
              Go to Save
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="structure">Course Structure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <CourseDetailsForm
            courseData={courseData}
            setCourseData={setCourseData}
            mode="edit"
            onSave={handleUpdateGeneralInfo}
          />
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Editing Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>You can add new lessons and quizzes to both existing and new chapters.</li>
                  <li>New chapters will be added at the bottom of existing chapters.</li>
                  <li>Make sure to save your changes before leaving this page.</li>
                  <li>Video lessons require a video file to be uploaded.</li>
                  <li>Quizzes must have at least one question with a correct answer.</li>
                </ul>
              </div>
            </div>
          </div>
          
          {courseData ? (
            <EditCourseStructure
              courseData={courseData}
              setCourseData={(newData) => {
                setCourseData(newData);
                setHasUnsavedChanges(true);
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600">Loading course structure...</p>
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-between items-center gap-4 pt-6 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 font-medium">⚠ Unsaved changes</span>
              ) : (
                <span className="text-green-600 font-medium">✓ All changes saved</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveAllChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className={`px-6 py-3 text-sm font-medium text-white rounded-md transition-colors ${
                !hasUnsavedChanges || isSaving
                  ? "bg-neutral-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                "Save All Changes"
              )}
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit
            </button>
          </div>
          <CoursePreview courseData={courseData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
