"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Play,
  PlayCircle,
  FileText,
  Infinity,
  Smartphone,
  Award,
} from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils/courseUtils";
import { toast } from "sonner";

import CourseChatCard from "./CourseChatCard";
import GiftCourseModal from "@/components/modals/GiftCourseModal";
import CourseActionButtons from "./CourseActionButtons";

export default function CourseSidebar({
  course,
  activeDiscount,
  totalDuration,
  openPreviewModal,
  isEnrolled,
  onEnroll,
  onEnrollSuccess,
}) {
  const router = useRouter();
  const [giftModalOpen, setGiftModalOpen] = useState(false);

  const handleEnroll = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isEnrolled) {
      router.push(`/enrollments`);
      return;
    }
    if (onEnroll) {
      onEnroll();
      return;
    }
    router.push(`/courses/${course.id}/enroll`);
  };

  const handleIntroClick = () => {
    if (!course.intro_video_public_id) return;
    const introLesson = {
      title: "Course Introduction",
      lesson_type: "video",
      video_public_id: course.intro_video_public_id,
      is_preview: true,
    };
    openPreviewModal(introLesson);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/courses/${course.id}`;
    const shareData = {
      title: course.title,
      text: `Check out this course: ${course.title}`,
      url: shareUrl,
    };

    try {
      // Try native share if available (mobile browsers)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Course link copied to clipboard!");
      }
    } catch (error) {
      // If share was cancelled or failed, try clipboard
      if (error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Course link copied to clipboard!");
        } catch (clipboardError) {
          toast.error("Failed to share course");
        }
      }
    }
  };

  const handleGiftCourse = () => {
    // Only allow gifting free courses for now
    if (Number(course.price) !== 0) {
      toast.error("Only free courses can be gifted at this time");
      return;
    }
    setGiftModalOpen(true);
  };

  return (
    <>
      <div className="hidden lg:block w-full lg:w-[340px] flex-shrink-0 relative z-20">
        <div className="sticky top-6 space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card/90 backdrop-blur-xl">
            <div
              onClick={handleIntroClick}
              className="relative aspect-video bg-muted cursor-pointer group border-b border-border"
            >
              <img
                src={
                  course.thumbnail_url || "https://via.placeholder.com/400x225"
                }
                alt={course.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-background/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-foreground fill-current ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 w-full text-center">
                <span className="text-white text-xs font-bold drop-shadow-md">
                  Preview this course
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                {activeDiscount ? (
                  <>
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(activeDiscount.discountedPrice)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through font-normal">
                      {formatPrice(activeDiscount.originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded ml-auto">
                      {activeDiscount.value}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>

              <CourseActionButtons
                course={course}
                activeDiscount={activeDiscount}
                isEnrolled={isEnrolled}
                onEnrollSuccess={onEnrollSuccess}
                className="mb-3"
              />
              <p className="text-xs text-center text-muted-foreground mb-6">
                30-Day Money-Back Guarantee
              </p>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground">
                  This course includes:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2.5">
                  <li className="flex items-center gap-3">
                    <PlayCircle className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDuration(totalDuration)} on-demand video</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {course.total_resources || 0} downloadable resources
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Infinity className="w-4 h-4 text-muted-foreground" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span>Access on mobile and TV</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <button 
                  onClick={handleShare}
                  className="text-xs font-semibold text-foreground underline hover:text-primary"
                >
                  Share
                </button>
                <button 
                  onClick={handleGiftCourse}
                  className="text-xs font-semibold text-foreground underline hover:text-primary"
                >
                  Gift this course
                </button>
                <button className="text-xs font-semibold text-foreground underline hover:text-primary">
                  Apply Coupon
                </button>
              </div>
            </div>
          </div>

          <CourseChatCard courseId={course.id} isEnrolled={isEnrolled} />
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {activeDiscount ? (
                  <>
                    <span className="text-xl sm:text-2xl font-bold text-foreground">
                      {formatPrice(activeDiscount.discountedPrice)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(activeDiscount.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">30-Day Money-Back</p>
            </div>

            <Button
              onClick={handleEnroll}
              className="h-11 px-6 sm:px-8 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              {isEnrolled ? "Go to Course" : "Enroll Now"}
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:hidden h-20" />

      {/* Gift Course Modal */}
      <GiftCourseModal
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
      />
    </>
  );
}

