import { connectDB } from "./src/config/db.js";
import { server } from "./src/app.js";
import { initCronJobs } from "./src/cron/init.cron.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // 1. Establish database connection (MongoDB)
    await connectDB();

    // 2. Start HTTP server with Socket.io attached
    server.listen(PORT, () => {
      console.log(`🚀 Mentora API server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io initialized on port ${PORT}`);

      // 3. Initialize background scheduled cron jobs
      initCronJobs();
    });
  } catch (error) {
    console.error("❌ Fatal startup error:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\n⚠️ Shutting down server gracefully (SIGINT)...");
  server.close(() => {
    console.log("🛑 HTTP server closed.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n⚠️ Shutting down server gracefully (SIGTERM)...");
  server.close(() => {
    console.log("🛑 HTTP server closed.");
    process.exit(0);
  });
});

bootstrap();
