"use client";

import { toast } from "sonner";
import enrollInCourse from "@/lib/apiCalls/enrollments/enrollInCourse";

/**
 * Handle course purchase or gift action
 * Routes user to appropriate flow based on course price and action type
 * 
 * @param {Object} course - Course object with id, price, title
 * @param {string} type - 'self' for personal purchase, 'gift' for gifting
 * @param {Object} options - Additional options
 * @param {Function} options.router - Next.js router instance
 * @param {Function} options.openGiftModal - Function to open gift modal (for free courses)
 * @param {Function} options.onEnrollSuccess - Callback after successful free enrollment
 * @param {boolean} options.isAuthenticated - Whether user is logged in
 * @returns {Promise<void>}
 */
export async function handlePurchase(course, type, options = {}) {
  const { 
    router, 
    openGiftModal, 
    onEnrollSuccess, 
    isAuthenticated = false 
  } = options;

  // Check authentication first
  if (!isAuthenticated) {
    toast.error("Please login to continue");
    router?.push("/login");
    return;
  }

  const isFree = Number(course.price) === 0;
  const isGift = type === "gift";

  // Handle all courses as direct enrollment or gift
  if (isGift) {
    // Open gift modal
    if (openGiftModal) {
      openGiftModal();
    }
  } else {
    // Enroll directly
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

/**
 * Get effective price considering discounts
 * @param {Object} course - Course object
 * @param {Object} activeDiscount - Active discount object
 * @returns {number} Effective price
 */
export function getEffectivePrice(course, activeDiscount) {
  if (activeDiscount?.discountedPrice !== undefined) {
    return activeDiscount.discountedPrice;
  }
  return Number(course.price) || 0;
}

/**
 * Check if course is free
 * @param {Object} course - Course object
 * @param {Object} activeDiscount - Active discount object
 * @returns {boolean}
 */
export function isFreeCourse(course, activeDiscount) {
  return getEffectivePrice(course, activeDiscount) === 0;
}
