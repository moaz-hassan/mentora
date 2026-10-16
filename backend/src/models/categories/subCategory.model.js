import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const subCategorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    category_id: {
      type: String,
      required: true,
      ref: "Category",
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "sub_categories",
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

subCategorySchema.virtual("id").get(function () {
  return this._id;
});

const SubCategory = mongoose.models.SubCategory || mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;
