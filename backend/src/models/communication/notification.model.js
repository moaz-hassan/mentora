import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const notificationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    user_id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      enum: [
        "course_approved",
        "course_rejected",
        "chapter_approved",
        "chapter_rejected",
        "new_message",
        "new_enrollment",
        "course_completed",
        "certificate_issued",
        "announcement",
        "info",
        "success",
        "warning",
        "error",
      ],
      default: "info",
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    related_id: {
      type: String,
      default: null,
    },
    related_type: {
      type: String,
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
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

notificationSchema.virtual("id").get(function () {
  return this._id;
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
