import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const enrollmentSchema = new mongoose.Schema(
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
    enrolled_at: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        completedLessons: [],
        completedChapters: [],
        completedQuizzes: [],
        quizScores: {},
        completionPercentage: 0,
        lastAccessed: null,
        currentChapterId: null,
        currentLessonId: null,
        totalWatchTime: 0,
        lessonWatchTime: {},
      }),
    },
  },
  {
    timestamps: true,
    collection: "enrollments",
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

enrollmentSchema.virtual("id").get(function () {
  return this._id;
});

// Compound unique index: student cannot enroll twice in the same course
enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });
enrollmentSchema.index({ course_id: 1, student_id: 1 });

enrollmentSchema.virtual("Course", {
  ref: "Course",
  localField: "course_id",
  foreignField: "_id",
  justOne: true,
});

enrollmentSchema.virtual("Student", {
  ref: "User",
  localField: "student_id",
  foreignField: "_id",
  justOne: true,
});

const Enrollment =
  mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
