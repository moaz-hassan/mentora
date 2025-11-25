/**
 * Logging Worker
 * Purpose: Process logging jobs from Bull queue
 */

import { loggingQueue } from "../config/queue.js";
import models from "../models/index.js";

const { AuditLog, PaymentLog, EnrollmentLog, ErrorLog, ModerationLog, NotificationLog } = models;

// Batch configuration
const BATCH_SIZE = 50;
const BATCH_TIMEOUT = 5000; // 5 seconds

let logBatch = [];
let batchTimer = null;

/**
 * Flush batch to database
 */
const flushBatch = async () => {
  if (logBatch.length === 0) return;

  const currentBatch = [...logBatch];
  logBatch = [];

  try {
    // Group logs by type
    const grouped = currentBatch.reduce((acc, log) => {
      if (!acc[log.type]) acc[log.type] = [];
      acc[log.type].push(log.data);
      return acc;
    }, {});

    // Bulk insert for each type
    const promises = [];

    if (grouped.audit) {
      promises.push(AuditLog.bulkCreate(grouped.audit, { ignoreDuplicates: true }));
    }
    if (grouped.payment) {
      promises.push(PaymentLog.bulkCreate(grouped.payment, { ignoreDuplicates: true }));
    }
    if (grouped.enrollment) {
      promises.push(EnrollmentLog.bulkCreate(grouped.enrollment, { ignoreDuplicates: true }));
    }
    if (grouped.error) {
      promises.push(ErrorLog.bulkCreate(grouped.error, { ignoreDuplicates: true }));
    }
    if (grouped.moderation) {
      promises.push(ModerationLog.bulkCreate(grouped.moderation, { ignoreDuplicates: true }));
    }
    if (grouped.notification) {
      promises.push(NotificationLog.bulkCreate(grouped.notification, { ignoreDuplicates: true }));
    }

    await Promise.all(promises);
    console.log(`✅ Flushed ${currentBatch.length} logs to database`);
  } catch (error) {
    console.error("❌ Error flushing log batch:", error);
    // Re-add failed logs to batch for retry
    logBatch.push(...currentBatch);
  }
};

/**
 * Add log to batch
 */
const addToBatch = async (log) => {
  logBatch.push(log);

  // Flush if batch is full
  if (logBatch.length >= BATCH_SIZE) {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    await flushBatch();
  } else {
    // Set timer to flush after timeout
    if (!batchTimer) {
      batchTimer = setTimeout(async () => {
        batchTimer = null;
        await flushBatch();
      }, BATCH_TIMEOUT);
    }
  }
};

/**
 * Process logging job
 */
loggingQueue.process(async (job) => {
  const { type, data } = job.data;

  try {
    // Add to batch for bulk processing
    await addToBatch({ type, data });

    return { success: true, message: "Log added to batch" };
  } catch (error) {
    console.error("❌ Error processing logging job:", error);
    throw error;
  }
});

/**
 * Graceful shutdown - flush remaining logs
 */
process.on("SIGTERM", async () => {
  console.log("⚠️  SIGTERM received, flushing remaining logs...");
  if (batchTimer) {
    clearTimeout(batchTimer);
  }
  await flushBatch();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("⚠️  SIGINT received, flushing remaining logs...");
  if (batchTimer) {
    clearTimeout(batchTimer);
  }
  await flushBatch();
  process.exit(0);
});

console.log("✅ Logging worker started");

export default loggingQueue;
