import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const settingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "general",
      trim: true,
      index: true,
    },
    data_type: {
      type: String,
      enum: ["string", "number", "boolean", "json"],
      default: "string",
    },
    is_public: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "settings",
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

settingsSchema.virtual("id").get(function () {
  return this._id;
});

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
