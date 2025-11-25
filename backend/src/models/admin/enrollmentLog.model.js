import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const EnrollmentLog = sequelize.define(
  "EnrollmentLog",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    enrollment_id: {
      type: DataTypes.STRING(50),
      references: { model: "enrollments", key: "id" },
    },
    student_id: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
    },
    course_id: {
      type: DataTypes.STRING(50),
      references: { model: "courses", key: "id" },
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    enrollment_source: {
      type: DataTypes.STRING(50),
    },
    payment_status: {
      type: DataTypes.STRING(20),
    },
    previous_status: {
      type: DataTypes.STRING(20),
    },
    new_status: {
      type: DataTypes.STRING(20),
    },
    metadata: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: "enrollment_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["student_id"] },
      { fields: ["course_id"] },
      { fields: ["created_at"] },
    ],
  }
);

export default EnrollmentLog;
