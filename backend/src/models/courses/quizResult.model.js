import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const quizResultSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    quiz_id: {
      type: String,
      required: true,
      ref: "Quiz",
      index: true,
    },
    student_id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    taken_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "quiz_results",
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

quizResultSchema.virtual("id").get(function () {
  return this._id;
});

const QuizResult =
  mongoose.models.QuizResult || mongoose.model("QuizResult", quizResultSchema);

export default QuizResult;
