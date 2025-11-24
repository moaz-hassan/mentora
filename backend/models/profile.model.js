import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/db.js";

const Profile = sequelize.define("Profile", {
  id: { type: DataTypes.STRING(50), primaryKey: true, defaultValue: () => uuidv4() },
  user_id: { type: DataTypes.STRING(50), allowNull: false },
  bio: { type: DataTypes.TEXT },
  avatar_url: { type: DataTypes.STRING(255) },
  headline: { type: DataTypes.STRING(255) },
  social_links: { type: DataTypes.JSON },
}, { tableName: "profiles", timestamps: false });

export default Profile;
