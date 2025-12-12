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
    admin_id: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
      field: "admin_id",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
      { fields: ["admin_id"] },
      { fields: ["created_at"] },
    ],
  }
);

export default NotificationLog;
