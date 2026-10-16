import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const profileSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    bio: { type: String, default: "" },
    avatar_url: { type: String, default: "" },
    headline: { type: String, default: "" },
    social_links: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
      index: true,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    collection: "users",
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

userSchema.virtual("id").get(function () {
  return this._id;
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
