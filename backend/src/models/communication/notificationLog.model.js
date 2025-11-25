import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const NotificationLog = sequelize.define(
  "NotificationLog",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    notification_id: {
      type: DataTypes.STRING(50),
      references: { model: "notifications", key: "id" },
    },
    sender_id: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
    },
    target_audience: {
      type: DataTypes.STRING(50),
    },
    recipient_count: {
      type: DataTypes.INTEGER,
    },
    delivered_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    opened_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    clicked_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failed_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
    },
    sent_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "notification_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["notification_id"] },
      { fields: ["sender_id"] },
      { fields: ["created_at"] },
    ],
  }
);

export default NotificationLog;
