
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play } from "lucide-react";
import CourseHeader from "@/components/pages/courses/courseDetails/CourseHeader";
import CourseCurriculum from "@/components/pages/courses/courseDetails/CourseCurriculum";
import InstructorSection from "@/components/pages/courses/courseDetails/InstructorSection";
import CourseReviews from "@/components/pages/courses/courseDetails/CourseReviews";
import CourseSidebar from "@/components/pages/courses/courseDetails/CourseSidebar";
import { getActiveDiscount } from "@/lib/utils/courseUtils";
import { calculateTotalLessons, calculateTotalDuration } from "@/lib/utils/courseUtils";
import PreviewLessonModal from "@/components/modals/PreviewLessonModal";
import CoursePageSkeleton from "@/components/skeleton/CoursePageSkeleton";
import CourseNotFound from "@/components/fallback/CourseNotFound";
import getCourseById from "@/lib/apiCalls/courses/getCourseById";
import checkEnrollment from "@/lib/apiCalls/enrollments/checkEnrollment";
import enrollInCourse from "@/lib/apiCalls/enrollments/enrollInCourse";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

export default function CoursePreviewPage() {
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    lesson: null,
  });
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCoursePreview();
    checkUserEnrollment();
  }, [params.id]);

  const fetchCoursePreview = async () => {
    try {
      const response = await getCourseById(params.id);
      if (response.success) {
        setCourse(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setLoading(false);
    }
  };

  const checkUserEnrollment = async () => {
    try {
      const enrolled = await checkEnrollment(params.id);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error("Error checking enrollment:", error);
      setIsEnrolled(false);
    }
  };

  const openPreviewModal = (lesson) => {
    setPreviewModal({
      isOpen: true,
      lesson: lesson,
    });
  };

  const handleIntroClick = () => {
    if (!course?.intro_video_public_id) return;
    const introLesson = {
      title: "Course Introduction",
      lesson_type: "video",
      video_public_id: course.intro_video_public_id,
      is_preview: true,
    };
    openPreviewModal(introLesson);
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      lesson: null,
    });
  };

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to enroll in this course");
      return;
    }

    try {
      const response = await enrollInCourse(course.id);
      if (response.success) {
        handleEnrollmentSuccess();
        toast.success("Enrolled successfully!");
      } else {
        toast.error(response.message || "Failed to enroll");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("An error occurred while enrolling");
    }
  };

  if (loading) return <CoursePageSkeleton />;
  if (!course) return <CourseNotFound />;

  const totalLessons = calculateTotalLessons(course.Chapters);
  const totalDuration = calculateTotalDuration(course.Chapters);
  const activeDiscount = getActiveDiscount(course);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 relative pb-20 lg:pb-0">
      <div className="lg:hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="px-4 py-6">
          <CourseHeader course={course} />
        </div>
      </div>

      <div className="hidden lg:block absolute top-0 left-0 w-full h-[550px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto lg:px-8 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <div className="flex-1 min-w-0 w-full">
            <div className="hidden lg:block">
              <CourseHeader course={course} />
            </div>
            <div className="lg:hidden px-4 -mt-4 mb-8">
              <div 
                onClick={handleIntroClick}
                className="relative aspect-video rounded-xl overflow-hidden shadow-xl border-4 border-white bg-gray-900 cursor-pointer group"
              >
                <img
                  src={course.thumbnail_url || "https://via.placeholder.com/400x225"}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-gray-900 fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-3 w-full text-center">
                  <span className="text-white text-xs font-bold drop-shadow-md bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    Preview Course
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:space-y-8 px-4 lg:px-0">
              <CourseCurriculum
                course={course}
                openPreviewModal={openPreviewModal}
                totalLessons={totalLessons}
                totalDuration={totalDuration}
              />

              <InstructorSection course={course} />

              <CourseReviews course={course} isEnrolled={isEnrolled} />
            </div>
          </div>

          <CourseSidebar
            course={course}
            activeDiscount={activeDiscount}
            totalDuration={totalDuration}
            openPreviewModal={openPreviewModal}
            isEnrolled={isEnrolled}
            onEnroll={handleEnroll}
            onEnrollSuccess={handleEnrollmentSuccess}
          />
        </div>
        <PreviewLessonModal
          isOpen={previewModal.isOpen}
          onClose={closePreviewModal}
          lesson={previewModal.lesson}
        />
      </div>
    </div>
  );
}