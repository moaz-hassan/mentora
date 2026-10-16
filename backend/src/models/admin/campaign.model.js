import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const campaignSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    banner_url: {
      type: String,
      default: "",
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: String,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "campaigns",
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

campaignSchema.virtual("id").get(function () {
  return this._id;
});

campaignSchema.virtual("Creator", {
  ref: "User",
  localField: "created_by",
  foreignField: "_id",
  justOne: true,
});

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
