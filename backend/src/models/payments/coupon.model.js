import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const couponSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    course_id: {
      type: String,
      ref: "Course",
      default: null,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    is_global: {
      type: Boolean,
      default: false,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    used_count: {
      type: Number,
      default: 0,
    },
    max_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "coupons",
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

couponSchema.virtual("id").get(function () {
  return this._id;
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
