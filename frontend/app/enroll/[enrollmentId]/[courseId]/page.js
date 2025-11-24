"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  FileText,
  MessageSquare,
  Download,
  Menu,
  X,
} from "lucide-react";
import { MessageInstructorButton } from "@/components/MessageInstructorButton";

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("resources");

  useEffect(() => {
    fetchCourseData();
  }, [params.enrollmentId, params.courseId]);

  const fetchCourseData = async () => {
    try {
      // Import API service
      const { getCoursePlayerData } = await import(
        "@/lib/apiCalls/enrollments/enrollment.service"
      );

      // Fetch real data from API
      const response = await getCoursePlayerData(
        params.enrollmentId,
        params.courseId
      );

      if (response.success) {
        setCourseData(response.data.course);
        setProgress(response.data.progress);

        // Set initial lesson
        const firstLesson = response.data.course.Chapters[0]?.Lessons[0];
        if (firstLesson) {
          setCurrentLesson(firstLesson);
        }

        setLoading(false);
        return;
      }

      // Fallback to mock data if API fails
      const mockData = {
        course: {
          id: params.courseId,
          title: "Advanced React Patterns",
          instructor: {
            name: "John Doe",
            profile_picture_url: "https://via.placeholder.com/40",
          },
          Chapters: [
            {
              id: "ch1",
              title: "Introduction",
              order_number: 1,
              Lessons: [
                {
                  id: "l1",
                  title: "Welcome to the Course",
                  lesson_type: "video",
                  video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                  duration: 300,
                  order_number: 1,
                },
                {
                  id: "l2",
                  title: "Course Overview",
                  lesson_type: "video",
                  video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                  duration: 420,
                  order_number: 2,
                },
              ],
            },
            {
              id: "ch2",
              title: "Advanced Hooks",
              order_number: 2,
              Lessons: [
                {
                  id: "l3",
                  title: "Custom Hooks Deep Dive",
                  lesson_type: "video",
                  video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                  duration: 600,
                  order_number: 1,
                },
                {
                  id: "l4",
                  title: "useReducer vs useState",
                  lesson_type: "video",
                  video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                  duration: 480,
                  order_number: 2,
                },
              ],
            },
          ],
        },
        progress: {
          completedLessons: ["l1"],
          completionPercentage: 25,
          currentLessonId: "l2",
        },
      };

      setCourseData(mockData.course);
      setProgress(mockData.progress);
      
      // Set initial lesson
      const firstLesson = mockData.course.Chapters[0]?.Lessons[0];
      if (firstLesson) {
        setCurrentLesson(firstLesson);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      // Import API service
      const { updateProgress } = await import(
        "@/lib/apiCalls/enrollments/enrollment.service"
      );

      // Update progress via API
      await updateProgress(params.enrollmentId, {
        completedLessonId: currentLesson.id,
      });

      setProgress((prev) => ({
        ...prev,
        completedLessons: [...(prev.completedLessons || []), currentLesson.id],
      }));
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const handleLessonChange = async (lesson) => {
    setCurrentLesson(lesson);
    
    // Update progress with current lesson
    try {
      const { updateProgress } = await import(
        "@/lib/apiCalls/enrollments/enrollment.service"
      );

      await updateProgress(params.enrollmentId, {
        currentLessonId: lesson.id,
      });
    } catch (error) {
      console.error("Error updating current lesson:", error);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress.completedLessons?.includes(lessonId);
  };

  const getNextLesson = () => {
    if (!courseData || !currentLesson) return null;

    let found = false;
    for (const chapter of courseData.Chapters) {
      for (const lesson of chapter.Lessons) {
        if (found) return lesson;
        if (lesson.id === currentLesson.id) found = true;
      }
    }
    return null;
  };

  const getPreviousLesson = () => {
    if (!courseData || !currentLesson) return null;

    let prevLesson = null;
    for (const chapter of courseData.Chapters) {
      for (const lesson of chapter.Lessons) {
        if (lesson.id === currentLesson.id) return prevLesson;
        prevLesson = lesson;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <button
            onClick={() => router.push("/dashboard/student")}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const prevLesson = getPreviousLesson();

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/student")}
            className="text-gray-300 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-lg">{courseData.title}</h1>
            <p className="text-gray-400 text-sm">
              {progress.completionPercentage}% Complete
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-gray-300 text-sm">
            by {courseData.instructor.name}
          </div>
          <MessageInstructorButton
            instructorId={courseData.instructor.id}
            instructorName={courseData.instructor.name}
            courseId={courseData.id}
            variant="outline"
            size="sm"
            className="hidden md:flex border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col">
          {/* Video */}
          <div className="flex-1 bg-black flex items-center justify-center">
            {currentLesson?.video_url ? (
              <video
                ref={videoRef}
                src={currentLesson.video_url}
                controls
                className="w-full h-full"
                onEnded={handleLessonComplete}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-white text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p>No video available for this lesson</p>
              </div>
            )}
          </div>

          {/* Lesson Info & Navigation */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-white font-semibold text-lg">
                  {currentLesson?.title}
                </h2>
                <p className="text-gray-400 text-sm">
                  {Math.floor((currentLesson?.duration || 0) / 60)} min
                </p>
              </div>

              <button
                onClick={handleLessonComplete}
                disabled={isLessonCompleted(currentLesson?.id)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isLessonCompleted(currentLesson?.id)
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isLessonCompleted(currentLesson?.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => prevLesson && handleLessonChange(prevLesson)}
                disabled={!prevLesson}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  prevLesson
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <button
                onClick={() => nextLesson && handleLessonChange(nextLesson)}
                disabled={!nextLesson}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  nextLesson
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-gray-800 border-t border-gray-700">
            <div className="flex border-b border-gray-700">
              {["resources", "notes", "chat"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? "text-white border-b-2 border-blue-600"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 h-48 overflow-y-auto">
              {activeTab === "resources" && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">
                    Downloadable resources for this lesson
                  </p>
                  {/* TODO: Add actual resources */}
                  <div className="text-gray-500 text-sm">
                    No resources available
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div>
                  <textarea
                    placeholder="Take notes here..."
                    className="w-full h-32 bg-gray-700 text-white rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              {activeTab === "chat" && (
                <div className="text-gray-400 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-center">Chat feature coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-80" : "w-0"
          } bg-gray-800 border-l border-gray-700 overflow-hidden transition-all duration-300`}
        >
          <div className="h-full overflow-y-auto p-4">
            <h3 className="text-white font-semibold mb-4">Course Content</h3>

            {courseData.Chapters.map((chapter) => (
              <div key={chapter.id} className="mb-4">
                <div className="text-white font-medium mb-2 px-3 py-2 bg-gray-700 rounded">
                  {chapter.title}
                </div>

                <div className="space-y-1">
                  {chapter.Lessons.map((lesson) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isCurrent = currentLesson?.id === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonChange(lesson)}
                        className={`w-full text-left px-3 py-2 rounded flex items-center space-x-3 ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{lesson.title}</p>
                          <p className="text-xs text-gray-400">
                            {Math.floor((lesson.duration || 0) / 60)} min
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
