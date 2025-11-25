import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    instructor_id: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(500), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    learning_objectives: { type: DataTypes.JSON, allowNull: true }, // Array of strings
    requirements: { type: DataTypes.JSON, allowNull: true }, // Array of strings
    target_audience: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING(100) },
    subcategory: { type: DataTypes.STRING(100) },
    level: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
      defaultValue: "beginner",
    },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    thumbnail_url: { type: DataTypes.STRING(255) },
    thumbnail_public_id: { type: DataTypes.STRING(255) },
    intro_video_url: { type: DataTypes.STRING(500) },
    intro_video_public_id: { type: DataTypes.STRING(255) },
    intro_video_hls_url: { type: DataTypes.STRING(500) },
    intro_video_duration: { type: DataTypes.INTEGER, defaultValue: 0 },
    have_discount: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed"),
    },
    discount_value: { type: DataTypes.DECIMAL(10, 2) },
    discount_start_date: { type: DataTypes.DATE },
    discount_end_date: { type: DataTypes.DATE },

    badge: { type: DataTypes.STRING(50) },

    // Review system fields
    status: {
      type: DataTypes.ENUM("draft", "pending_review", "approved", "rejected"),
      defaultValue: "draft",
    },
    submitted_for_review_at: { type: DataTypes.DATE, allowNull: true },
    reviewed_at: { type: DataTypes.DATE, allowNull: true },
    reviewed_by: { type: DataTypes.STRING(50), allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    ai_analysis: { type: DataTypes.JSON, allowNull: true },
  },
  { tableName: "courses", timestamps: true }
);

export default Course;
