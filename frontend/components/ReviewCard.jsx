"use client";

import { Star } from "lucide-react";

export default function ReviewCard({ review }) {
  // Get user initials
  const getInitials = () => {
    const firstName = review.User?.first_name || "";
    const lastName = review.User?.last_name || "";
    const firstInitial = firstName[0] || "";
    const lastInitial = lastName[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
  };

  // Get full name
  const getFullName = () => {
    const firstName = review.User?.first_name || "";
    const lastName = review.User?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "Anonymous User";
  };

  // Format date as relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  };

  // Generate consistent color based on user ID
  const getAvatarColor = () => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-yellow-100 text-yellow-600",
      "bg-indigo-100 text-indigo-600",
      "bg-red-100 text-red-600",
      "bg-teal-100 text-teal-600",
    ];
    const userId = review.User?.id || review.user_id || 0;
    const index = typeof userId === 'string' ? userId.length : userId;
    return colors[index % colors.length];
  };

  const initials = getInitials();
  const fullName = getFullName();
  const relativeTime = getRelativeTime(review.created_at);
  const avatarColor = getAvatarColor();
  const rating = review.rating || 0;

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0" role="article" aria-label={`Review by ${fullName}`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor}`}>
          {review.User?.Profile?.profile_picture_url ? (
            <img
              src={review.User.Profile.profile_picture_url}
              alt={fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">{initials}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{fullName}</h4>
            <span className="text-sm text-gray-500 flex-shrink-0">{relativeTime}</span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-3" role="img" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Review Text */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {review.review_text}
          </p>
        </div>
      </div>
    </div>
  );
}
