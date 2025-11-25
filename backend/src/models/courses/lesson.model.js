import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const Lesson = sequelize.define("Lesson", {
  id: { type: DataTypes.STRING(50), primaryKey: true, defaultValue: () => uuidv4() },
  chapter_id: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  lesson_type: { 
    type: DataTypes.ENUM("video", "text"), 
    defaultValue: "video" 
  },
  video_url: { type: DataTypes.STRING(255) },
  video_public_id: { type: DataTypes.STRING(255) },
  hls_url: { type: DataTypes.STRING(500) },
  is_preview: { type: DataTypes.BOOLEAN, defaultValue: false },
  content: { type: DataTypes.TEXT },
  duration: { type: DataTypes.INTEGER },
  order_number: { type: DataTypes.INTEGER },
}, { tableName: "lessons", timestamps: false });

export default Lesson;
