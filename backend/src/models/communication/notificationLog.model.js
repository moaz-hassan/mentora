import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const notificationLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    notification_id: {
      type: String,
      ref: "Notification",
      index: true,
    },
    admin_id: {
      type: String,
      ref: "User",
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "sent",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "notification_logs",
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

notificationLogSchema.virtual("id").get(function () {
  return this._id;
});

const NotificationLog =
  mongoose.models.NotificationLog ||
  mongoose.model("NotificationLog", notificationLogSchema);

export default NotificationLog;
