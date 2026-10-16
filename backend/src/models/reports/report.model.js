import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const reportSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    reported_by: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    content_reference: {
      type: String,
      default: null,
    },
    content_type: {
      type: String,
      enum: ["Course", "Lesson", "Quiz", "general"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["pending", "in-review", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    ai_category: {
      type: String,
      default: null,
    },
    ai_severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    reviewed_by: {
      type: String,
      ref: "User",
      default: null,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
    reporter_type: {
      type: String,
      enum: ["student", "instructor"],
      default: "student",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    contact_email: {
      type: String,
      default: null,
    },
    contact_phone: {
      type: String,
      default: null,
    },
    attachments: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    internal_notes: {
      type: String,
      default: null,
    },
    resolution_details: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "reports",
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

reportSchema.virtual("id").get(function () {
  return this._id;
});

reportSchema.virtual("Reporter", {
  ref: "User",
  localField: "reported_by",
  foreignField: "_id",
  justOne: true,
});

reportSchema.virtual("Reviewer", {
  ref: "User",
  localField: "reviewed_by",
  foreignField: "_id",
  justOne: true,
});

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
