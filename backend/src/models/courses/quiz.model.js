import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const quizSchema = new mongoose.Schema(
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
    order_number: {
      type: Number,
      default: 1,
    },
    questions: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "quizzes",
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

quizSchema.virtual("id").get(function () {
  return this._id;
});

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

export default Quiz;
