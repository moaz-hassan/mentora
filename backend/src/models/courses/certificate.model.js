import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const Certificate = sequelize.define(
  "Certificate",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    student_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    course_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    certificate_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    download_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    public_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completion_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "certificates",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["student_id", "course_id"],
        name: "unique_student_course_certificate",
      },
    ],
  }
);

export default Certificate;
