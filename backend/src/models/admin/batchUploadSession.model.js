import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const BatchUploadSession = sequelize.define(
  "BatchUploadSession",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    course_id: { type: DataTypes.STRING(50), allowNull: false },
    instructor_id: { type: DataTypes.STRING(50), allowNull: false },
    total_videos: { type: DataTypes.INTEGER, defaultValue: 0 },
    uploaded_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    failed_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("in_progress", "completed", "cancelled", "failed"),
      defaultValue: "in_progress",
    },
    upload_data: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Array of {lessonId, status, videoUrl, publicId, error}",
    },
    started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    completed_at: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "batch_upload_sessions", timestamps: true }
);

export default BatchUploadSession;
