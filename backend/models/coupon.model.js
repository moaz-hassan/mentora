import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/db.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    course_id: { type: DataTypes.STRING(50), allowNull: false, references: { model: "Courses", key: "id" } },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount_start_date: { type: DataTypes.DATE, allowNull: false },
    discount_end_date: { type: DataTypes.DATE, allowNull: false },
    used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    max_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "coupons", timestamps: false }
);

export default Coupon;
