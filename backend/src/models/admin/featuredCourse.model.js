import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const featuredCourseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    course_id: {
      type: String,
      required: true,
      ref: "Course",
      index: true,
    },
    campaign_id: {
      type: String,
      ref: "Campaign",
      default: null,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "featured_courses",
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

featuredCourseSchema.virtual("id").get(function () {
  return this._id;
});

featuredCourseSchema.virtual("Course", {
  ref: "Course",
  localField: "course_id",
  foreignField: "_id",
  justOne: true,
});

const FeaturedCourse =
  mongoose.models.FeaturedCourse ||
  mongoose.model("FeaturedCourse", featuredCourseSchema);

export default FeaturedCourse;
