"use client";

import { useState, useEffect } from "react";
import getCourseById from "@/lib/apiCalls/courses/getCourseById";
import { useParams } from "next/navigation";
import {
  Star,
  Users,
  Clock,
  Award,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CoursePageSkeleton from "@/components/skeleton/CoursePageSkeleton";
import CourseNotFound from "@/components/fallback/CourseNotFound";
import PreviewLessonModal from "@/components/PreviewLessonModal";
import {
  formatDuration,
  calculateTotalLessons,
  calculateTotalDuration,
  formatPrice,
  getActiveDiscount,
  getInstructorName,
  getInstructorInitials,
  formatLessonDuration,
} from "@/lib/courseUtils";
import Link from "next/link";

export default function CoursePreviewPage() {
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    lesson: null,
  });

  useEffect(() => {
    fetchCoursePreview();
  }, [params.id]);

  const fetchCoursePreview = async () => {
    try {
      const response = await getCourseById(params.id);
      if (response.success) {
        setCourse(response.data);
        if (response.data.Chapters?.length > 0) {
          setExpandedChapters({ [response.data.Chapters[0].id]: true });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const openPreviewModal = (lesson) => {
    setPreviewModal({
      isOpen: true,
      lesson: lesson,
    });
  };

  const handleIntroClick = () => {
    if (!course.intro_video_public_id) return;
    
    const introLesson = {
      title: "Course Introduction",
      lesson_type: "video",
      video_public_id: course.intro_video_public_id,
      is_preview: true,
    };

    setPreviewModal({
      isOpen: true,
      lesson: introLesson,
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      lesson: null,
    });
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && previewModal.isOpen) {
        closePreviewModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [previewModal.isOpen]);

  if (loading) return <CoursePageSkeleton />;
  if (!course) return <CourseNotFound />;

  const totalLessons = calculateTotalLessons(course.Chapters);
  const totalDuration = calculateTotalDuration(course.Chapters);
  const activeDiscount = getActiveDiscount(course);
  const instructorName = getInstructorName(course.User);
  const instructorInitials = getInstructorInitials(course.User);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Redesigned */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Link href={"/"} className="hover:text-blue-600 cursor-pointer">Home</Link>
                <span>/</span>
                <Link href={"/courses"} className="hover:text-blue-600 cursor-pointer">Courses</Link>
                <span>/</span>
                <span className="text-gray-900">{course.title}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.category && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium px-3 py-1">
                    {course.category}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant="outline" className="text-xs font-medium px-3 py-1 border-gray-300">
                    {course.level}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-semibold text-gray-900">4.5</span>
                  <span className="text-gray-600 ml-1 text-sm">(0 reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-sm">0 students</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="text-sm">{formatDuration(totalDuration)}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                  {course.User?.Profile?.avatar_url ? (
                    <img 
                      src={course.User.Profile.avatar_url} 
                      alt={instructorName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600">
                      {instructorInitials}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created by</p>
                  <p className="font-semibold text-gray-900">{instructorName}</p>
                </div>
              </div>
            </div>

            {/* Right: Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-4">
                {/* Clickable Thumbnail for Intro Video */}
                <div 
                  className="relative aspect-video bg-gray-900 cursor-pointer group overflow-hidden"
                  onClick={handleIntroClick}
                >
                  <img
                    src={course.thumbnail_url || "https://via.placeholder.com/400x225?text=Course+Preview"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Play className="w-7 h-7 text-gray-900 fill-gray-900 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-medium text-sm bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm">
                    Preview this course
                  </div>
                </div>

                <div className="p-6">
                  {/* Price Section */}
                  <div className="mb-6">
                    {activeDiscount ? (
                      <div>
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatPrice(activeDiscount.discountedPrice)}
                          </span>
                          <span className="text-xl text-gray-500 line-through">
                            {formatPrice(activeDiscount.originalPrice)}
                          </span>
                        </div>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold">
                          {activeDiscount.type === "percentage"
                            ? `${activeDiscount.value}% OFF`
                            : `${activeDiscount.value} OFF`}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(course.price)}
                      </span>
                    )}
                  </div>

                  {/* Enroll Button */}
                  <Button 
                    size="lg" 
                    className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base"
                  >
                    Enroll Now
                  </Button>

                  {/* Course Includes */}
                  <div className="border-t border-gray-200 pt-5">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                      This course includes:
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <PlayCircle className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>{totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>{formatDuration(totalDuration)} of content</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Award className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Curriculum */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Content</h2>
              <p className="text-sm text-gray-600 mb-6">
                {course.Chapters?.length || 0} {course.Chapters?.length === 1 ? "chapter" : "chapters"} • {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"} • {formatDuration(totalDuration)}
              </p>

              <div className="space-y-3">
                {course.Chapters?.map((chapter) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center flex-1">
                        <div className="mr-3">
                          {expandedChapters[chapter.id] ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {chapter.Lessons?.length || 0} {chapter.Lessons?.length === 1 ? "lesson" : "lessons"}
                          </p>
                        </div>
                      </div>
                    </button>

                    {expandedChapters[chapter.id] && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        <div className="p-4 space-y-1">
                          {chapter.Lessons?.map((lesson) => (
                            <div
                              key={lesson.id}
                              onClick={() => lesson.is_preview && openPreviewModal(lesson)}
                              className={`flex items-center justify-between py-3 px-3 rounded-md transition-colors ${
                                lesson.is_preview 
                                  ? "hover:bg-blue-50 cursor-pointer" 
                                  : "hover:bg-white cursor-default"
                              }`}
                            >
                              <div className="flex items-center flex-1">
                                {lesson.lesson_type === "video" ? (
                                  <PlayCircle 
                                    className={`w-4 h-4 mr-3 flex-shrink-0 ${
                                      lesson.is_preview ? "text-blue-600" : "text-gray-400"
                                    }`} 
                                  />
                                ) : (
                                  <FileText 
                                    className={`w-4 h-4 mr-3 flex-shrink-0 ${
                                      lesson.is_preview ? "text-blue-600" : "text-gray-400"
                                    }`} 
                                  />
                                )}
                                <span className="text-sm text-gray-700 flex-1">
                                  {lesson.title}
                                </span>
                                {lesson.is_preview && (
                                  <Badge 
                                    variant="outline" 
                                    className="ml-3 text-xs border-blue-500 text-blue-600 font-medium"
                                  >
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-gray-500 ml-3">
                                {formatLessonDuration(lesson.duration || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar (empty on mobile, sticky card on desktop) */}
          <div className="lg:col-span-1 hidden lg:block"></div>
        </div>
      </div>

      {/* Preview Lesson Modal */}
      <PreviewLessonModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        lesson={previewModal.lesson}
      />
    </div>
  );
}
