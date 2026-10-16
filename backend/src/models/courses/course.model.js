import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const courseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    instructor_id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    learning_objectives: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    target_audience: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      index: true,
    },
    subcategory: {
      type: String,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    price: {
      type: Number,
      default: 0.0,
      index: true,
    },
    thumbnail_url: {
      type: String,
      default: "",
    },
    thumbnail_public_id: {
      type: String,
      default: "",
    },
    intro_video_url: {
      type: String,
      default: "",
    },
    intro_video_public_id: {
      type: String,
      default: "",
    },
    intro_video_hls_url: {
      type: String,
      default: "",
    },
    intro_video_duration: {
      type: Number,
      default: 0,
    },
    have_discount: {
      type: Boolean,
      default: false,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
    },
    discount_value: {
      type: Number,
    },
    discount_start_date: {
      type: Date,
    },
    discount_end_date: {
      type: Date,
    },
    is_featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    badge: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "pending_review", "approved", "rejected"],
      default: "draft",
      index: true,
    },
    submitted_for_review_at: {
      type: Date,
    },
    reviewed_at: {
      type: Date,
    },
    reviewed_by: {
      type: String,
    },
    rejection_reason: {
      type: String,
      default: "",
    },
    ai_analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "courses",
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

courseSchema.virtual("id").get(function () {
  return this._id;
});

// Full-text search index
courseSchema.index(
  {
    title: "text",
    subtitle: "text",
    description: "text",
  },
  {
    weights: {
      title: 10,
      subtitle: 5,
      description: 1,
    },
    name: "course_text_search_idx",
  }
);

// Filtering & sorting indexes
courseSchema.index({ category: 1, price: 1, status: 1 });
courseSchema.index({ instructor_id: 1, createdAt: -1 });

// Virtual associations for seamless population
courseSchema.virtual("Instructor", {
  ref: "User",
  localField: "instructor_id",
  foreignField: "_id",
  justOne: true,
});

courseSchema.virtual("Chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "course_id",
});

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
