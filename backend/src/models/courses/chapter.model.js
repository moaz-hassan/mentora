import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chapterSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    order_number: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "chapters",
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

chapterSchema.virtual("id").get(function () {
  return this._id;
});

chapterSchema.virtual("Lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "chapter_id",
});

const Chapter = mongoose.models.Chapter || mongoose.model("Chapter", chapterSchema);

export default Chapter;
