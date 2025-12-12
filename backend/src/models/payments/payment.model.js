import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.STRING(50), primaryKey: true, defaultValue: () => uuidv4() },
  user_id: { type: DataTypes.STRING(50), allowNull: false },
  course_id: { type: DataTypes.STRING(50), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  currency: { type: DataTypes.STRING(10), defaultValue: "USD" },
  payment_method: { type: DataTypes.ENUM("card", "paypal", "stripe"), defaultValue: "card" },
  status: { type: DataTypes.ENUM("pending", "completed", "failed"), defaultValue: "pending" },
  coupon_code: { type: DataTypes.STRING(50), allowNull: true },
  discount_amount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "payments", timestamps: false });

export default Payment;

