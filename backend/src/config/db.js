import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "online_courses_platform",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "0000",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false, // Set to console.log to see SQL queries
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    // await sequelize.sync({ alter: true });
    // console.log("Database models synchronized");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export { connectDB, sequelize };
