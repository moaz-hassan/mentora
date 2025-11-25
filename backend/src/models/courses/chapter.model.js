import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const Chapter = sequelize.define(
  "Chapter",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    course_id: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    order_number: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "chapters", timestamps: true, updatedAt: "updatedAt", createdAt: "createdAt" }
);

export default Chapter;
