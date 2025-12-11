

import Queue from "bull";
import { redisQueueClient } from "./redis.js";


const queueOptions = {
  createClient: (type) => {
    switch (type) {
      case "client":
        return redisQueueClient.duplicate();
      case "subscriber":
        return redisQueueClient.duplicate();
      case "bclient":
        return redisQueueClient.duplicate();
      default:
        return redisQueueClient.duplicate();
    }
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    },
    removeOnComplete: 100, 
    removeOnFail: 200 
  }
};


export const loggingQueue = new Queue("logging", queueOptions);
export const notificationQueue = new Queue("notifications", queueOptions);
export const analyticsQueue = new Queue("analytics", queueOptions);
export const emailQueue = new Queue("emails", queueOptions);


const setupQueueEvents = (queue, name) => {
  queue.on("error", (error) => {
    console.error(`❌ ${name} queue error:`, error);
  });

  queue.on("waiting", (jobId) => {
    console.log(`⏳ ${name} job ${jobId} is waiting`);
  });

  queue.on("active", (job) => {
    console.log(`🔄 ${name} job ${job.id} started`);
  });

  queue.on("completed", (job, result) => {
    console.log(`✅ ${name} job ${job.id} completed`);
  });

  queue.on("failed", (job, err) => {
    console.error(`❌ ${name} job ${job.id} failed:`, err.message);
  });

  queue.on("stalled", (job) => {
    console.warn(`⚠️  ${name} job ${job.id} stalled`);
  });
};


setupQueueEvents(loggingQueue, "Logging");
setupQueueEvents(notificationQueue, "Notification");
setupQueueEvents(analyticsQueue, "Analytics");
setupQueueEvents(emailQueue, "Email");



export const addLoggingJob = async (logData, options = {}) => {
  return await loggingQueue.add(logData, {
    priority: options.priority || 5,
    delay: options.delay || 0,
    ...options
  });
};


export const addNotificationJob = async (notificationData, options = {}) => {
  return await notificationQueue.add(notificationData, {
    priority: options.priority || 3,
    delay: options.delay || 0,
    ...options
  });
};


export const addAnalyticsJob = async (analyticsData, options = {}) => {
  return await analyticsQueue.add(analyticsData, {
    priority: options.priority || 7,
    delay: options.delay || 0,
    ...options
  });
};


export const addEmailJob = async (emailData, options = {}) => {
  return await emailQueue.add(emailData, {
    priority: options.priority || 2,
    delay: options.delay || 0,
    ...options
  });
};


export const getQueueStats = async (queue) => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
};


export const getAllQueueStats = async () => {
  const [logging, notification, analytics, email] = await Promise.all([
    getQueueStats(loggingQueue),
    getQueueStats(notificationQueue),
    getQueueStats(analyticsQueue),
    getQueueStats(emailQueue)
  ]);

  return {
    logging,
    notification,
    analytics,
    email
  };
};


export const cleanQueue = async (queue, grace = 3600000) => {
  const jobs = await queue.clean(grace, "completed");
  return jobs.length;
};


export const pauseQueue = async (queue) => {
  await queue.pause();
  console.log(`⏸️  Queue ${queue.name} paused`);
};


export const resumeQueue = async (queue) => {
  await queue.resume();
  console.log(`▶️  Queue ${queue.name} resumed`);
};


export const closeQueues = async () => {
  try {
    await Promise.all([
      loggingQueue.close(),
      notificationQueue.close(),
      analyticsQueue.close(),
      emailQueue.close()
    ]);
    console.log("✅ All queues closed gracefully");
  } catch (error) {
    console.error("❌ Error closing queues:", error);
  }
};

export default {
  loggingQueue,
  notificationQueue,
  analyticsQueue,
  emailQueue,
  addLoggingJob,
  addNotificationJob,
  addAnalyticsJob,
  addEmailJob,
  getQueueStats,
  getAllQueueStats,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  closeQueues
};
