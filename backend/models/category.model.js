import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
  }
);

export default Category;
