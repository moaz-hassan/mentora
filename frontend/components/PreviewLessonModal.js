"use client";

import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Sparkles,
  PlayCircle,
  ChevronRight,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// Optimized dynamic import - load only when needed
const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-neutral-800 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  ),
});

export default function PreviewLessonModal({ isOpen, onClose, lesson }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [frozenLesson, setFrozenLesson] = useState(null);
  const [playerKey, setPlayerKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Increment key to force remount of VideoPlayer
      setPlayerKey((prev) => prev + 1);
      // Freeze the lesson content when opening to prevent re-renders
      setFrozenLesson(lesson);
      setShowModal(true);
      // Use RAF for smooth animation start
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.body.style.overflow = "hidden";
    } else {
      // Start closing animation
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShowModal(false);
        // Clear frozen lesson after modal is fully hidden
        setTimeout(() => setFrozenLesson(null), 50);
      }, 250);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, lesson]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-8">
      {/* Modern Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-2xl transition-all duration-250 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
          relative w-full h-full lg:h-auto lg:max-h-[88vh] max-w-4xl 
          bg-white dark:bg-neutral-950
          lg:rounded-xl shadow-2xl overflow-hidden flex flex-col
          transform transition-all duration-250 ease-out
          ${isAnimating ? "scale-100 opacity-100" : "scale-98 opacity-0"}
        `}
        style={{ willChange: isAnimating ? "transform, opacity" : "auto" }}
      >
        {/* Minimalist Header */}
        <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              {frozenLesson?.lesson_type === "video" ? (
                <PlayCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              )}
            </div>
            <h2 className="text-sm lg:text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {frozenLesson?.title || "Course Preview"}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {frozenLesson?.duration && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-800">
                  <Clock className="w-3 h-3" />
                  {frozenLesson.duration}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
          {/* Premium CTA Card */}
          <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-teal-600 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1">
                <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm lg:text-base font-bold">
                    Unlock Full Access
                  </h3>
                  <p className="text-blue-50 text-xs leading-relaxed">
                    Lifetime access to all lessons & certificate
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full sm:w-auto bg-white hover:bg-neutral-50 text-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 font-bold text-xs px-5 py-2 h-auto"
                onClick={onClose}
              >
                Enroll Now
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Video Player Section - Only show for video lessons */}
          {frozenLesson?.lesson_type === "video" && (
            <div className="w-full bg-black">
              <div className="aspect-video w-full">
                {frozenLesson.video_public_id ? (
                  <VideoPlayer
                    key={`video-${playerKey}`}
                    publicId={frozenLesson.video_public_id}
                    autoPlay={false}
                    showNextButton={false}
                  />
                ) : (
                  <div className="w-full aspect-video flex flex-col items-center justify-center bg-neutral-950">
                    <PlayCircle className="w-16 h-16 mb-3 text-neutral-700" />
                    <p className="text-sm text-neutral-500">
                      Video unavailable
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Container */}
          <div className="max-w-3xl mx-auto px-4 lg:px-6 py-5 lg:py-6">
            {/* Lesson Content */}
            <div className="space-y-3">
              {frozenLesson?.content ? (
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none prose-sm
                      prose-headings:font-bold prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100
                      prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-2
                      prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                      prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:text-sm
                      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100 prose-strong:font-semibold
                      prose-ul:text-neutral-700 dark:prose-ul:text-neutral-300
                      prose-ol:text-neutral-700 dark:prose-ol:text-neutral-300
                      prose-li:marker:text-blue-600 dark:prose-li:marker:text-blue-400 prose-li:text-sm
                      prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:text-neutral-700 dark:prose-blockquote:text-neutral-300 prose-blockquote:text-sm
                      prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-neutral-100 dark:prose-code:bg-neutral-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                      prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-pre:text-xs"
                  dangerouslySetInnerHTML={{ __html: frozenLesson.content }}
                />
              ) : (
                <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                    {frozenLesson?.description ||
                      "No description available for this lesson."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
