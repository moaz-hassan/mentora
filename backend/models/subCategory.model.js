import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const SubCategory = sequelize.define(
  "SubCategory",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    category_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "sub_categories",
    timestamps: true,
  }
);

export default SubCategory;
