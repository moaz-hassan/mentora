import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chatMessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    room_id: {
      type: String,
      required: true,
      ref: "ChatRoom",
      index: true,
    },
    sender_id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "chat_messages",
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

chatMessageSchema.virtual("id").get(function () {
  return this._id;
});

chatMessageSchema.index({ room_id: 1, createdAt: -1 });

chatMessageSchema.virtual("Sender", {
  ref: "User",
  localField: "sender_id",
  foreignField: "_id",
  justOne: true,
});

const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
