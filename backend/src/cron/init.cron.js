import cron from "node-cron";
import { sendStudentProgressEmails } from "./studentProgress.cron.js";
import { sendInstructorPerformanceEmails } from "./instructorPerformance.cron.js";

export const initCronJobs = () => {
  cron.schedule("0 9 1 * *", async () => {
    console.log("📧 Running monthly student progress emails...");
    try {
      await sendStudentProgressEmails();
    } catch (error) {
      console.error("❌ Error sending student progress emails:", error);
    }
  });

  cron.schedule("0 10 1 * *", async () => {
    console.log("📧 Running monthly instructor performance emails...");
    try {
      await sendInstructorPerformanceEmails();
    } catch (error) {
      console.error("❌ Error sending instructor performance emails:", error);
    }
  });

  console.log("✅ Cron jobs initialized");
};
