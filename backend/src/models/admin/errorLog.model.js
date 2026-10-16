import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const errorLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    user_id: {
      type: String,
      ref: "User",
      default: null,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
      default: "",
    },
    endpoint: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      default: "",
    },
    ip_address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "error_logs",
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

errorLogSchema.virtual("id").get(function () {
  return this._id;
});

const ErrorLog =
  mongoose.models.ErrorLog || mongoose.model("ErrorLog", errorLogSchema);

export default ErrorLog;
