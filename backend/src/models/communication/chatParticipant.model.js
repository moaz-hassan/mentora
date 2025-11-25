import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const ChatParticipant = sequelize.define(
  "ChatParticipant",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    room_id: { type: DataTypes.STRING(50), allowNull: false },
    user_id: { type: DataTypes.STRING(50), allowNull: false },
    role: {
      type: DataTypes.ENUM("member", "admin"),
      defaultValue: "member",
    },
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    last_read_at: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "chat_participants",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["room_id", "user_id"] },
      { fields: ["user_id"] },
      { fields: ["room_id"] },
    ],
  }
);

export default ChatParticipant;
