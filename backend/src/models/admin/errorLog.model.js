import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const ErrorLog = sequelize.define(
  "ErrorLog",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    error_type: {
      type: DataTypes.STRING(100),
    },
    error_message: {
      type: DataTypes.TEXT,
    },
    stack_trace: {
      type: DataTypes.TEXT,
    },
    user_id: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
    },
    request_url: {
      type: DataTypes.TEXT,
    },
    request_method: {
      type: DataTypes.STRING(10),
    },
    request_body: {
      type: DataTypes.JSON,
    },
    severity: {
      type: DataTypes.STRING(20),
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "error_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["user_id"] },
      { fields: ["severity"] },
      { fields: ["resolved"] },
      { fields: ["created_at"] },
    ],
  }
);

export default ErrorLog;
