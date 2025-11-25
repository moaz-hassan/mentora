import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const Campaign = sequelize.define(
  "Campaign",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    campaign_type: {
      type: DataTypes.ENUM("featured_courses", "banner", "email", "notification"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "paused", "completed"),
      defaultValue: "draft",
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    target_audience: {
      type: DataTypes.ENUM("all", "students", "instructors"),
      defaultValue: "all",
    },
    banner_image_url: {
      type: DataTypes.STRING(500),
    },
    banner_link: {
      type: DataTypes.STRING(500),
    },
    impressions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    conversions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    revenue_generated: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.STRING(50),
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "campaigns",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["status"] },
      { fields: ["campaign_type"] },
      { fields: ["created_by"] },
    ],
  }
);

export default Campaign;
