import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const categorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "categories",
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

categorySchema.virtual("id").get(function () {
  return this._id;
});

categorySchema.virtual("SubCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "category_id",
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
