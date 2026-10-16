import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const auditLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
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
    target_type: {
      type: String,
      default: "",
    },
    target_id: {
      type: String,
      default: "",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip_address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "audit_logs",
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

auditLogSchema.virtual("id").get(function () {
  return this._id;
});

auditLogSchema.virtual("Admin", {
  ref: "User",
  localField: "admin_id",
  foreignField: "_id",
  justOne: true,
});

const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
