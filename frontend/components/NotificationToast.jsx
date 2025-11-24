"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

let toastId = 0;

export function NotificationToast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "course_approved":
        return "✅";
      case "course_rejected":
        return "❌";
      case "new_enrollment":
        return "🎓";
      case "new_review":
        return "⭐";
      case "new_message":
        return "💬";
      case "certificate_issued":
        return "🏆";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">
            {getNotificationIcon(notification.type)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const notification = event.detail;
      const id = toastId++;
      setToasts((prev) => [...prev, { ...notification, id }]);
    };

    window.addEventListener("show-notification", handleNotification);
    return () =>
      window.removeEventListener("show-notification", handleNotification);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Helper function to show notifications
export function showNotification(notification) {
  const event = new CustomEvent("show-notification", { detail: notification });
  window.dispatchEvent(event);
}
