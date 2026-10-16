import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const tokenSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["verify-email", "reset-password"],
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Native MongoDB TTL index automatically purges expired tokens!
    },
  },
  {
    timestamps: true,
    collection: "tokens",
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

tokenSchema.virtual("id").get(function () {
  return this._id;
});

const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);

export default Token;
