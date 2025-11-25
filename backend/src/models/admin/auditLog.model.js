import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    admin_id: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
    },
    action_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.STRING(50),
    },
    description: {
      type: DataTypes.TEXT,
    },
    ip_address: {
      type: DataTypes.STRING(45),
    },
    user_agent: {
      type: DataTypes.TEXT,
    },
    before_state: {
      type: DataTypes.JSON,
    },
    after_state: {
      type: DataTypes.JSON,
    },
    status: {
      type: DataTypes.STRING(20),
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["admin_id"] },
      { fields: ["created_at"] },
      { fields: ["action_type"] },
      { fields: ["resource_type", "resource_id"] },
    ],
  }
);

export default AuditLog;
