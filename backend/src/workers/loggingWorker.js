

import { loggingQueue } from "../config/queue.js";
import models from "../models/index.js";

const { AuditLog, PaymentLog, EnrollmentLog, ErrorLog, ModerationLog, NotificationLog } = models;


const BATCH_SIZE = 50;
const BATCH_TIMEOUT = 5000; 

let logBatch = [];
let batchTimer = null;


const insertLogs = async (Model, documents) => {
  try {
    await Model.insertMany(documents, { ordered: false });
  } catch (error) {
    const writeErrors = Array.isArray(error?.writeErrors) ? error.writeErrors : [];

    const onlyDuplicateKeyErrors =
      error?.code === 11000 ||
      (writeErrors.length > 0 &&
        writeErrors.every((writeError) => writeError?.err?.code === 11000));

    if (!onlyDuplicateKeyErrors) {
      throw error;
    }

    console.warn(`⚠️  Skipped duplicate ${Model.modelName} entries`);
  }
};


export const flushBatch = async () => {
  if (logBatch.length === 0) return;

  const currentBatch = [...logBatch];
  logBatch = [];

  try {
    
    const grouped = currentBatch.reduce((acc, log) => {
      if (!acc[log.type]) acc[log.type] = [];
      acc[log.type].push(log.data);
      return acc;
    }, {});

    
    const promises = [];

    if (grouped.audit) {
      promises.push(insertLogs(AuditLog, grouped.audit));
    }
    if (grouped.payment) {
      promises.push(insertLogs(PaymentLog, grouped.payment));
    }
    if (grouped.enrollment) {
      promises.push(insertLogs(EnrollmentLog, grouped.enrollment));
    }
    if (grouped.error) {
      promises.push(insertLogs(ErrorLog, grouped.error));
    }
    if (grouped.moderation) {
      promises.push(insertLogs(ModerationLog, grouped.moderation));
    }
    if (grouped.notification) {
      promises.push(insertLogs(NotificationLog, grouped.notification));
    }

    await Promise.all(promises);
    console.log(`✅ Flushed ${currentBatch.length} logs to database`);
  } catch (error) {
    console.error("❌ Error flushing log batch:", error);
    
    logBatch.push(...currentBatch);
  }
};


export const addToBatch = async (log) => {
  logBatch.push(log);

  
  if (logBatch.length >= BATCH_SIZE) {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    await flushBatch();
  } else {
    
    if (!batchTimer) {
      batchTimer = setTimeout(async () => {
        batchTimer = null;
        await flushBatch();
      }, BATCH_TIMEOUT);
    }
  }
};


loggingQueue.process(async (job) => {
  const { type, data } = job.data;

  try {
    
    await addToBatch({ type, data });

    return { success: true, message: "Log added to batch" };
  } catch (error) {
    console.error("❌ Error processing logging job:", error);
    throw error;
  }
});


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
