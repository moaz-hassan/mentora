import { useState, useEffect, useCallback } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/apiCalls/notifications/notifications.apiCall";
import { toast } from "react-toastify";

/**
 * Custom hook for notifications management
 * @returns {Object} Notifications data and functions
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getNotifications(pageNum, 10);

      if (response.success) {
        if (pageNum === 1) {
          setNotifications(response.data || []);
        } else {
          setNotifications((prev) => [...prev, ...(response.data || [])]);
        }
        setHasMore(response.data?.length === 10);
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await markNotificationAsRead(notificationId);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await markAllNotificationsAsRead();

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  }, []);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  }, [page, fetchNotifications]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refetch: () => fetchNotifications(1),
  };
}
