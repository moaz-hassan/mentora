import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const certificateSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    student_id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    course_id: {
      type: String,
      required: true,
      ref: "Course",
      index: true,
    },
    certificate_url: {
      type: String,
      required: true,
    },
    download_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    issued_at: {
      type: Date,
      default: Date.now,
    },
    completion_date: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "certificates",
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

certificateSchema.virtual("id").get(function () {
  return this._id;
});

certificateSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

certificateSchema.virtual("student", {
  ref: "User",
  localField: "student_id",
  foreignField: "_id",
  justOne: true,
});

certificateSchema.virtual("course", {
  ref: "Course",
  localField: "course_id",
  foreignField: "_id",
  justOne: true,
});

const Certificate =
  mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);

export default Certificate;
