"use client";

import { toast } from "sonner";
import enrollInCourse from "@/lib/apiCalls/enrollments/enrollInCourse";


export async function handlePurchase(course, type, options = {}) {
  const { 
    router, 
    openGiftModal, 
    onEnrollSuccess, 
    isAuthenticated = false 
  } = options;

  
  if (!isAuthenticated) {
    toast.error("Please login to continue");
    router?.push("/login");
    return;
  }

  const isFree = Number(course.price) === 0;
  const isGift = type === "gift";

  
  if (isGift) {
    
    if (openGiftModal) {
      openGiftModal();
    }
  } else {
    
    try {
      const response = await enrollInCourse(course.id);
      if (response.success) {
        toast.success("Enrolled successfully!");
        onEnrollSuccess?.();
      } else {
        toast.error(response.message || "Failed to enroll");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("An error occurred while enrolling");
    }
  }
}


export function getEffectivePrice(course, activeDiscount) {
  if (activeDiscount?.discountedPrice !== undefined) {
    return activeDiscount.discountedPrice;
  }
  return Number(course.price) || 0;
}


export function isFreeCourse(course, activeDiscount) {
  return getEffectivePrice(course, activeDiscount) === 0;
}
