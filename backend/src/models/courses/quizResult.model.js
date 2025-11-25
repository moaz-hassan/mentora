import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const QuizResult = sequelize.define(
  "QuizResult",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    quiz_id: { type: DataTypes.STRING(50), allowNull: false },
    student_id: { type: DataTypes.STRING(50), allowNull: false },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [
        {
          id: "",
          answer: "",
          isCorrect: false,
        },
      ],
    },
    score: { type: DataTypes.INTEGER, defaultValue: 0 },
    taken_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "quiz_results", timestamps: false }
);

export default QuizResult;
