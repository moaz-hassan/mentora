import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const profileSchema = new mongoose.Schema(
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
    bio: {
      type: String,
      default: "",
    },
    avatar_url: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },
    social_links: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "profiles",
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

profileSchema.virtual("id").get(function () {
  return this._id;
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);

export default Profile;
