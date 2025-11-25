import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    reported_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    content_reference: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    content_type: {
      type: DataTypes.ENUM("Course", "Lesson", "Quiz", "general"),
      defaultValue: "general",
    },
    status: {
      type: DataTypes.ENUM("pending", "in-review", "resolved", "dismissed"),
      defaultValue: "pending",
    },
    ai_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ai_severity: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    reviewed_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reporter_type: {
      type: DataTypes.ENUM("student", "instructor"),
      defaultValue: "student",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact_phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolution_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Report;
