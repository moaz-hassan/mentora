import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    user_id: { type: DataTypes.STRING(50), allowNull: false },
    type: {
      type: DataTypes.ENUM(
        "course_approved",
        "course_rejected",
        "chapter_approved",
        "chapter_rejected",
        "new_message",
        "new_enrollment",
        "course_completed",
        "certificate_issued",
        "info",
        "success",
        "warning",
        "error"
      ),
      defaultValue: "info",
    },
    title: { type: DataTypes.STRING(255), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    related_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID of related resource (course_id, chapter_id, message_id, etc.)",
    },
    related_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of related resource (course, chapter, message, etc.)",
    },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "notifications", timestamps: false }
);

export default Notification;
