import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/db.js";

const LastRead = sequelize.define(
  "LastRead",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    roomId: { type: DataTypes.BIGINT, allowNull: false },
    userId: { type: DataTypes.BIGINT, allowNull: false },
    lastReadAt: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: "last_read", timestamps: true }
);

export default LastRead;
