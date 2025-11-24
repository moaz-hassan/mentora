import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/db.js";

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    type: {
      type: DataTypes.ENUM("group", "private"),
      allowNull: false,
    },
    course_id: { type: DataTypes.STRING(50), allowNull: true },
    name: { type: DataTypes.STRING(255), allowNull: true },
    created_by: { type: DataTypes.STRING(50), allowNull: true },
  },
  { tableName: "chat_rooms", timestamps: true }
);

export default ChatRoom;
