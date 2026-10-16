import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const paymentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    user_id: {
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    payment_method: {
      type: String,
      enum: ["card", "paypal", "stripe"],
      default: "card",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    coupon_code: {
      type: String,
      default: null,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "payments",
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

paymentSchema.virtual("id").get(function () {
  return this._id;
});

paymentSchema.virtual("Student", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

paymentSchema.virtual("Course", {
  ref: "Course",
  localField: "course_id",
  foreignField: "_id",
  justOne: true,
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
