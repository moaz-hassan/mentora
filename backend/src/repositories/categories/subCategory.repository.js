import SubCategory from "../../models/categories/subCategory.model.js";

class SubCategoryRepository {
  async findAll(filter = {}, sort = { name: 1 }) {
    return await SubCategory.find(filter)
      .populate({ path: "category_id", model: "Category", select: "id name" })
      .sort(sort)
      .exec();
  }

  async findById(id) {
    return await SubCategory.findById(id)
      .populate({ path: "category_id", model: "Category", select: "id name" })
      .exec();
  }

  async findByCategoryId(categoryId) {
    return await SubCategory.find({ category_id: categoryId })
      .sort({ name: 1 })
      .exec();
  }

  async findByNameAndCategory(name, categoryId) {
    return await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      category_id: categoryId,
    }).exec();
  }

  async create(subCategoryData) {
    return await SubCategory.create(subCategoryData);
  }

  async updateById(id, updateData) {
    return await SubCategory.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteById(id) {
    return await SubCategory.findByIdAndDelete(id).exec();
  }
}

export default new SubCategoryRepository();
