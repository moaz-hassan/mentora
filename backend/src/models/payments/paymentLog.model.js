import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const PaymentLog = sequelize.define(
  "PaymentLog",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    student_id: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
    },
    course_id: {
      type: DataTypes.STRING(50),
      references: { model: "courses", key: "id" },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "USD",
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    payment_status: {
      type: DataTypes.STRING(20),
    },
    coupon_code: {
      type: DataTypes.STRING(50),
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    payment_gateway: {
      type: DataTypes.STRING(50),
    },
    gateway_response: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: "payment_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["student_id"] },
      { fields: ["course_id"] },
      { fields: ["created_at"] },
      { fields: ["payment_status"] },
    ],
  }
);

export default PaymentLog;
