import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const lessonSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    chapter_id: {
      type: String,
      required: true,
      ref: "Chapter",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lesson_type: {
      type: String,
      enum: ["video", "text"],
      default: "video",
    },
    video_url: {
      type: String,
      default: "",
    },
    video_public_id: {
      type: String,
      default: "",
    },
    hls_url: {
      type: String,
      default: "",
    },
    is_preview: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0,
    },
    order_number: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "lessons",
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

lessonSchema.virtual("id").get(function () {
  return this._id;
});

lessonSchema.virtual("materials", {
  ref: "LessonMaterial",
  localField: "_id",
  foreignField: "lesson_id",
});

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

export default Lesson;
