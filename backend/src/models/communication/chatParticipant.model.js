import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chatParticipantSchema = new mongoose.Schema(
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
    user_id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "chat_participants",
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

chatParticipantSchema.virtual("id").get(function () {
  return this._id;
});

chatParticipantSchema.index({ room_id: 1, user_id: 1 }, { unique: true });

const ChatParticipant =
  mongoose.models.ChatParticipant ||
  mongoose.model("ChatParticipant", chatParticipantSchema);

export default ChatParticipant;
