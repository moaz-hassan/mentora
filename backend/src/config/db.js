import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "mentora",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "0000",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "3306",
    dialect: "mysql",
    logging: false,

    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : false,
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // await sequelize.sync({ alter: true });
    // console.log("✅ Database synchronized");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  }
}

export { connectDB, sequelize };
