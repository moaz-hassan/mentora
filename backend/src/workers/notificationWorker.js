/**
 * Notification Worker
 * Purpose: Process scheduled notifications from Bull queue
 */

import { notificationQueue } from "../config/queue.js";
import * as notificationService from "../services/communication/notification.service.js";

/**
 * Process notification job
 */
notificationQueue.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case "send_scheduled":
        // Send a scheduled notification
        const result = await notificationService.sendScheduledNotification(data.notificationLogId);
        return { success: true, result };

      case "broadcast":
        // Broadcast notification immediately
        const broadcastResult = await notificationService.broadcastNotification(data, data.adminId);
        return { success: true, result: broadcastResult };

      default:
        throw new Error(`Unknown notification job type: ${type}`);
    }
  } catch (error) {
    console.error("❌ Error processing notification job:", error);
    throw error;
  }
});

/**
 * Schedule notification check job (runs every minute)
 */
const scheduleNotificationCheck = async () => {
  try {
    const scheduledNotifications = await notificationService.getScheduledNotificationsToSend();

    for (const notification of scheduledNotifications) {
      await notificationQueue.add({
        type: "send_scheduled",
        data: { notificationLogId: notification.id }
      }, {
        priority: 1, // High priority
        attempts: 3
      });
    }

    if (scheduledNotifications.length > 0) {
      console.log(`📬 Queued ${scheduledNotifications.length} scheduled notifications`);
    }
  } catch (error) {
    console.error("❌ Error checking scheduled notifications:", error);
  }
};

// Check for scheduled notifications every minute
setInterval(scheduleNotificationCheck, 60000);

// Run immediately on startup
scheduleNotificationCheck();

console.log("✅ Notification worker started");

export default notificationQueue;
