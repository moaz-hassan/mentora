import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/db.js";

const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    student_id: { type: DataTypes.STRING(50), allowNull: false },
    course_id: { type: DataTypes.STRING(50), allowNull: false },
    enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    progress: {
      type: DataTypes.JSON,
      defaultValue: {
        completedLessons: [],
        completedChapters: [],
        completedQuizzes: [],
        quizScores: {},
        completionPercentage: 0,
        lastAccessed: null,
        currentChapterId: null,
        currentLessonId: null,
        totalWatchTime: 0,
        lessonWatchTime: {},
      },
    },
  },
  {
    tableName: "enrollments",
    timestamps: false,
    indexes: [{ unique: true, fields: ["student_id", "course_id"] }],
  }
);

export default Enrollment;
