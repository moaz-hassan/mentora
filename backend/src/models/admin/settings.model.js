import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const Settings = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    key: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.STRING(50),
    },
    description: {
      type: DataTypes.TEXT,
    },
    data_type: {
      type: DataTypes.ENUM("string", "number", "boolean", "json"),
      defaultValue: "string",
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["key"] },
      { fields: ["category"] },
    ],
  }
);

export default Settings;
