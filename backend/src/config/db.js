import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "mentora",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "0000",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false, 
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    // sequelize.sync({ force: true });
    // console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export { connectDB, sequelize };
