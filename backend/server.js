import { connectDB } from "./config/db.js";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();



connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log(`Database connection established and models synced`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
