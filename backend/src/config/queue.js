/**
 * Bull Queue Configuration
 * Purpose: Configure Bull queues for async job processing
 */

import Queue from "bull";
import { redisQueueClient } from "./redis.js";

// Queue options
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
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200 // Keep last 200 failed jobs
  }
};

// Create queues
export const loggingQueue = new Queue("logging", queueOptions);
export const notificationQueue = new Queue("notifications", queueOptions);
export const analyticsQueue = new Queue("analytics", queueOptions);
export const emailQueue = new Queue("emails", queueOptions);

// Queue event handlers
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

// Setup event handlers for all queues
setupQueueEvents(loggingQueue, "Logging");
setupQueueEvents(notificationQueue, "Notification");
setupQueueEvents(analyticsQueue, "Analytics");
setupQueueEvents(emailQueue, "Email");


/**
 * Add job to logging queue
 * @param {Object} logData - Log data to process
 * @param {Object} options - Job options
 * @returns {Promise<Job>} Bull job
 */
export const addLoggingJob = async (logData, options = {}) => {
  return await loggingQueue.add(logData, {
    priority: options.priority || 5,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Add job to notification queue
 * @param {Object} notificationData - Notification data
 * @param {Object} options - Job options
 * @returns {Promise<Job>} Bull job
 */
export const addNotificationJob = async (notificationData, options = {}) => {
  return await notificationQueue.add(notificationData, {
    priority: options.priority || 3,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Add job to analytics queue
 * @param {Object} analyticsData - Analytics data
 * @param {Object} options - Job options
 * @returns {Promise<Job>} Bull job
 */
export const addAnalyticsJob = async (analyticsData, options = {}) => {
  return await analyticsQueue.add(analyticsData, {
    priority: options.priority || 7,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Add job to email queue
 * @param {Object} emailData - Email data
 * @param {Object} options - Job options
 * @returns {Promise<Job>} Bull job
 */
export const addEmailJob = async (emailData, options = {}) => {
  return await emailQueue.add(emailData, {
    priority: options.priority || 2,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Get queue statistics
 * @param {Queue} queue - Bull queue
 * @returns {Promise<Object>} Queue statistics
 */
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

/**
 * Get all queue statistics
 * @returns {Promise<Object>} All queue statistics
 */
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

/**
 * Clean completed jobs from queue
 * @param {Queue} queue - Bull queue
 * @param {number} grace - Grace period in milliseconds
 * @returns {Promise<number>} Number of jobs cleaned
 */
export const cleanQueue = async (queue, grace = 3600000) => {
  const jobs = await queue.clean(grace, "completed");
  return jobs.length;
};

/**
 * Pause queue
 * @param {Queue} queue - Bull queue
 * @returns {Promise<void>}
 */
export const pauseQueue = async (queue) => {
  await queue.pause();
  console.log(`⏸️  Queue ${queue.name} paused`);
};

/**
 * Resume queue
 * @param {Queue} queue - Bull queue
 * @returns {Promise<void>}
 */
export const resumeQueue = async (queue) => {
  await queue.resume();
  console.log(`▶️  Queue ${queue.name} resumed`);
};

/**
 * Graceful shutdown
 */
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
