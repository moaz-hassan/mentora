import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const Ratings = sequelize.define("Ratings", {
  id: { type: DataTypes.STRING(50), primaryKey: true, defaultValue: () => uuidv4() },
  student_id: { type: DataTypes.STRING(50), allowNull: false },
  course_id: { type: DataTypes.STRING(50), allowNull: false },
  rating: { type: DataTypes.FLOAT, validate: { min: 1, max: 5 } },
  review: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "ratings",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["student_id", "course_id"] },
    { name: "idx_review_course", fields: ["course_id"] }
  ],
});

export default Ratings;
