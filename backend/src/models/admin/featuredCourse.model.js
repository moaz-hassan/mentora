import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const FeaturedCourse = sequelize.define(
  "FeaturedCourse",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    course_id: {
      type: DataTypes.STRING(50),
      references: { model: "courses", key: "id" },
      allowNull: false,
    },
    campaign_id: {
      type: DataTypes.STRING(50),
      references: { model: "campaigns", key: "id" },
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    featured_until: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "featured_courses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["course_id"] },
      { fields: ["campaign_id"] },
      { fields: ["is_active"] },
    ],
  }
);

export default FeaturedCourse;
