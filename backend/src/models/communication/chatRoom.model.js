import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chatRoomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    type: {
      type: String,
      enum: ["group", "private"],
      required: true,
      default: "group",
    },
    course_id: {
      type: String,
      ref: "Course",
      default: null,
      index: true,
    },
    name: {
      type: String,
      default: "",
    },
    created_by: {
      type: String,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "chat_rooms",
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

chatRoomSchema.virtual("id").get(function () {
  return this._id;
});

const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
