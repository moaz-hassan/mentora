
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "0 min";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  return `${minutes} min`;
}

export function calculateDiscountedPrice(originalPrice, discountType, discountValue) {
  if (!originalPrice || !discountType || !discountValue) {
    return originalPrice;
  }
  
  let discountedPrice = originalPrice;
  
  if (discountType === "percentage") {
    discountedPrice = originalPrice - (originalPrice * discountValue) / 100;
  } else if (discountType === "fixed") {
    discountedPrice = originalPrice - discountValue;
  }
  
  
  return Math.max(0, discountedPrice);
}


export function calculateTotalLessons(chapters) {
  if (!chapters || !Array.isArray(chapters)) return 0;
  
  return chapters.reduce((total, chapter) => {
    const lessonCount = chapter.Lessons ? chapter.Lessons.length : 0;
    return total + lessonCount;
  }, 0);
}

export function calculateTotalDuration(chapters) {
  if (!chapters || !Array.isArray(chapters)) return 0;
  
  return chapters.reduce((total, chapter) => {
    if (!chapter.Lessons) return total;
    
    const chapterDuration = chapter.Lessons.reduce((sum, lesson) => {
      return sum + (lesson.duration || 0);
    }, 0);
    
    return total + chapterDuration;
  }, 0);
}


export function calculateCourseStats(chapters) {
  return {
    lessonCount: calculateTotalLessons(chapters),
    totalDuration: calculateTotalDuration(chapters),
  };
}


export function formatPrice(price, currency = "$") {
  if (price === null || price === undefined) return `${currency}0`;
  const numPrice = parseFloat(price);
  if (numPrice === 0) return "Free";
  return `${currency}${numPrice.toFixed(2)}`;
}


export function isDiscountActive(startDate, endDate) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  const afterStart = !start || now >= start;
  const beforeEnd = !end || now <= end;
  
  return afterStart && beforeEnd;
}



export function getActiveDiscount(course) {
  if (!course || !course.have_discount) return null;
  
  const isActive = isDiscountActive(course.discount_start_date, course.discount_end_date);
  if (!isActive) return null;
  
  const originalPrice = parseFloat(course.price);
  const discountedPrice = calculateDiscountedPrice(
    originalPrice,
    course.discount_type,
    course.discount_value
  );
  
  return {
    type: course.discount_type,
    value: course.discount_value,
    originalPrice: originalPrice,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    endDate: course.discount_end_date,
  };
}


export function formatLessonDuration(seconds) {
  if (!seconds || seconds === 0) return "0 min";
  
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}


export function getInstructorName(user) {
  if (!user) return "Unknown Instructor";
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Unknown Instructor";
}


export function getInstructorInitials(user) {
  if (!user) return "?";
  const firstInitial = user.first_name?.[0] || "";
  const lastInitial = user.last_name?.[0] || "";
  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}



export function calculateAverageRating(ratings) {
  if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
    return null;
  }
  
  const sum = ratings.reduce((total, r) => total + (r.rating || 0), 0);
  return sum / ratings.length;
}



export function formatEnrollmentCount(count) {
  if (!count || count === 0) {
    return "Be first to enroll";
  }
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  
  return count.toString();
}
