import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/db.js";

const Quiz = sequelize.define(
  "Quiz",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    chapter_id: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    order_number: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  { tableName: "quizzes", timestamps: false }
);

export default Quiz;
