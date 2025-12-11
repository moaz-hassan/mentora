"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Gift, Loader2 } from "lucide-react";
import { handlePurchase, isFreeCourse } from "@/lib/utils/handlePurchase";
import useAuthStore from "@/store/authStore";
import GiftCourseModal from "@/components/modals/GiftCourseModal";


export default function CourseActionButtons({
  course,
  activeDiscount,
  isEnrolled,
  onEnrollSuccess,
  className = "",
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);

  const isFree = isFreeCourse(course, activeDiscount);

  const handleBuyNow = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setLoading(true);
    try {
      await handlePurchase(course, "self", {
        router,
        isAuthenticated,
        onEnrollSuccess: () => {
          setLoading(false);
          onEnrollSuccess?.();
        },
      });
    } finally {
      
      if (isFree) {
        setLoading(false);
      }
    }
  };

  const handleGiftCourse = async () => {
    await handlePurchase(course, "gift", {
      router,
      isAuthenticated,
      openGiftModal: () => setGiftModalOpen(true),
    });
  };

  
  if (isEnrolled) {
    return (
      <div className={className}>
        <Button
          onClick={() => router.push("/enrollments")}
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          Go to Course
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <Button
          onClick={handleBuyNow}
          disabled={loading}
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Enroll Now
            </>
          )}
        </Button>

        <Button
          onClick={handleGiftCourse}
          variant="outline"
          className="w-full h-11 text-sm font-semibold"
        >
          <Gift className="w-4 h-4 mr-2" />
          Gift This Course
        </Button>
      </div>

      {}
      <GiftCourseModal
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
      />
    </>
  );
}
