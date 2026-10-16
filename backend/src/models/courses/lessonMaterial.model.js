import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const lessonMaterialSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    lesson_id: {
      type: String,
      required: true,
      ref: "Lesson",
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    order_number: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "lesson_materials",
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

lessonMaterialSchema.virtual("id").get(function () {
  return this._id;
});

const LessonMaterial =
  mongoose.models.LessonMaterial ||
  mongoose.model("LessonMaterial", lessonMaterialSchema);

export default LessonMaterial;
