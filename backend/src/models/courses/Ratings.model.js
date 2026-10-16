import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ratingsSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: "",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "ratings",
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

ratingsSchema.virtual("id").get(function () {
  return this._id;
});

// Compound unique index: student can only review a course once
ratingsSchema.index({ student_id: 1, course_id: 1 }, { unique: true });
ratingsSchema.index({ course_id: 1 });

const Ratings = mongoose.models.Ratings || mongoose.model("Ratings", ratingsSchema);

export default Ratings;
