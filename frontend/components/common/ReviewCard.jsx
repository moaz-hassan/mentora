"use client";

import { Star } from "lucide-react";

export default function ReviewCard({ review }) {
  
  const getInitials = () => {
    const firstName = review.User?.first_name || "";
    const lastName = review.User?.last_name || "";
    const firstInitial = firstName[0] || "";
    const lastInitial = lastName[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
  };

  
  const getFullName = () => {
    const firstName = review.User?.first_name || "";
    const lastName = review.User?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "Anonymous User";
  };

  
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
    <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300" role="article" aria-label={`Review by ${fullName}`}>
      <div className="flex items-start gap-5">
        {}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${avatarColor} ring-2 ring-white`}>
          {review.User?.Profile?.profile_picture_url ? (
            <img
              src={review.User.Profile.profile_picture_url}
              alt={fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold">{initials}</span>
          )}
        </div>

        {}
        <div className="flex-1 min-w-0">
          {}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-900 text-base">{fullName}</h4>
              <span className="text-xs text-gray-500 font-medium">{relativeTime}</span>
            </div>
            
            {}
            <div className="flex items-center gap-0.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {}
          <div className="relative mt-3">
             <svg className="absolute -top-2 -left-2 w-6 h-6 text-gray-100 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
               <path d="M14.017 21L14.017 18C14.017 16.896 14.321 16.067 14.929 15.513C15.537 14.959 16.326 14.682 17.296 14.682C17.765 14.682 18.158 14.737 18.475 14.847C18.802 14.957 19.123 15.111 19.438 15.308C19.82 15.548 20.088 15.767 20.242 15.964C20.396 16.161 20.473 16.425 20.473 16.757C20.473 17.151 20.323 17.476 20.023 17.732C19.723 17.988 19.324 18.116 18.825 18.116C18.575 18.116 18.318 18.069 18.054 17.975C17.79 17.881 17.584 17.834 17.436 17.834C17.206 17.834 17.07 17.923 17.028 18.101C16.96 18.375 17.16 18.665 17.629 18.971C17.863 19.125 18.257 19.349 18.811 19.643C19.365 19.937 19.742 20.147 19.942 20.274L19.539 21H14.017ZM8.017 21L8.017 18C8.017 16.896 8.321 16.067 8.929 15.513C9.537 14.959 10.326 14.682 11.296 14.682C11.765 14.682 12.158 14.737 12.475 14.847C12.802 14.957 13.123 15.111 13.438 15.308C13.82 15.548 14.088 15.767 14.242 15.964C14.396 16.161 14.473 16.425 14.473 16.757C14.473 17.151 14.323 17.476 14.023 17.732C13.723 17.988 13.324 18.116 12.825 18.116C12.575 18.116 12.318 18.069 12.054 17.975C11.79 17.881 11.584 17.834 11.436 17.834C11.206 17.834 11.07 17.923 11.028 18.101C10.96 18.375 11.16 18.665 11.629 18.971C11.863 19.125 12.257 19.349 12.811 19.643C13.365 19.937 13.742 20.147 13.942 20.274L13.539 21H8.017Z" />
             </svg>
             <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap break-words pl-2">
               {review.review}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
