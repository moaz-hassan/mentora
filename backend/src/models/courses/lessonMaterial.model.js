import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const LessonMaterial = sequelize.define(
  "LessonMaterial",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    lesson_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "lessons",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    public_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_number: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "lesson_materials",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default LessonMaterial;
