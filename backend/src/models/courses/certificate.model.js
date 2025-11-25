import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const Certificate = sequelize.define("Certificate", {
  id: { type: DataTypes.STRING(50), primaryKey: true, defaultValue: () => uuidv4() },
  student_id: { type: DataTypes.STRING(50), allowNull: false },
  course_id: { type: DataTypes.STRING(50), allowNull: false },
  certificate_url: { type: DataTypes.STRING(255), allowNull: false },
  issued_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "certificates",
  timestamps: false,
  indexes: [{ unique: true, fields: ["student_id", "course_id"] }],
});

export default Certificate;
