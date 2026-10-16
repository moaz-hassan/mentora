import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const moderationLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    moderator_id: {
      type: String,
      ref: "User",
      index: true,
    },
    target_type: {
      type: String,
      required: true,
    },
    target_id: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "moderation_logs",
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

moderationLogSchema.virtual("id").get(function () {
  return this._id;
});

moderationLogSchema.virtual("Moderator", {
  ref: "User",
  localField: "moderator_id",
  foreignField: "_id",
  justOne: true,
});

const ModerationLog =
  mongoose.models.ModerationLog ||
  mongoose.model("ModerationLog", moderationLogSchema);

export default ModerationLog;
