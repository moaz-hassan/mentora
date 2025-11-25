import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const ModerationLog = sequelize.define(
  "ModerationLog",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    moderator_id: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
    },
    content_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    content_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    ai_analysis: {
      type: DataTypes.JSON,
    },
    previous_status: {
      type: DataTypes.STRING(20),
    },
    new_status: {
      type: DataTypes.STRING(20),
    },
  },
  {
    tableName: "moderation_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["moderator_id"] },
      { fields: ["content_type", "content_id"] },
      { fields: ["created_at"] },
    ],
  }
);

export default ModerationLog;
