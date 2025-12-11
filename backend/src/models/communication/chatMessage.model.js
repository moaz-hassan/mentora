import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../config/db.js";

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    room_id: { type: DataTypes.STRING(50), allowNull: false },
    sender_id: { type: DataTypes.STRING(50), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    message_type: {
      type: DataTypes.ENUM("text", "file", "system"),
      defaultValue: "text",
    },
    file_url: { type: DataTypes.STRING(255), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "chat_messages",
    timestamps: false,
    indexes: [
      {
        name: "idx_chat_messages_cursor",
        fields: ["room_id", { name: "created_at", order: "DESC" }],
      }
    ]
  }
);

export default ChatMessage;
