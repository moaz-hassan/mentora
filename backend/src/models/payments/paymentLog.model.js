import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const paymentLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    student_id: {
      type: String,
      ref: "User",
      index: true,
    },
    course_id: {
      type: String,
      ref: "Course",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
    },
    payment_method: {
      type: String,
      default: "card",
    },
    transaction_id: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "payment_logs",
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

paymentLogSchema.virtual("id").get(function () {
  return this._id;
});

paymentLogSchema.virtual("Student", {
  ref: "User",
  localField: "student_id",
  foreignField: "_id",
  justOne: true,
});

paymentLogSchema.virtual("Course", {
  ref: "Course",
  localField: "course_id",
  foreignField: "_id",
  justOne: true,
});

const PaymentLog =
  mongoose.models.PaymentLog || mongoose.model("PaymentLog", paymentLogSchema);

export default PaymentLog;
