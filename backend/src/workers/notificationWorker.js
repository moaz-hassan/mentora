

import { notificationQueue } from "../config/queue.js";
import * as notificationService from "../services/communication/notification.service.js";


notificationQueue.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case "send_scheduled":
        
        const result = await notificationService.sendScheduledNotification(data.notificationLogId);
        return { success: true, result };

      case "broadcast":
        
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


const scheduleNotificationCheck = async () => {
  try {
    const scheduledNotifications = await notificationService.getScheduledNotificationsToSend();

    for (const notification of scheduledNotifications) {
      await notificationQueue.add({
        type: "send_scheduled",
        data: { notificationLogId: notification.id }
      }, {
        priority: 1, 
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


setInterval(scheduleNotificationCheck, 60000);


scheduleNotificationCheck();

console.log("✅ Notification worker started");

export default notificationQueue;
