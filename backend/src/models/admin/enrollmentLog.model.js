import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const enrollmentLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    enrollment_id: {
      type: String,
      ref: "Enrollment",
      index: true,
    },
    student_id: {
      type: String,
      ref: "User",
      index: true,
    },
    course_id: {
      type: String,
      ref: "Course",
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "enrollment_logs",
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

enrollmentLogSchema.virtual("id").get(function () {
  return this._id;
});

enrollmentLogSchema.virtual("Student", {
  ref: "User",
  localField: "student_id",
  foreignField: "_id",
  justOne: true,
});

enrollmentLogSchema.virtual("Course", {
  ref: "Course",
  localField: "course_id",
  foreignField: "_id",
  justOne: true,
});

const EnrollmentLog =
  mongoose.models.EnrollmentLog ||
  mongoose.model("EnrollmentLog", enrollmentLogSchema);

export default EnrollmentLog;
