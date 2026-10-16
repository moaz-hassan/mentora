import Category from "../../models/categories/category.model.js";

class CategoryRepository {
  async findAll(filter = {}, sort = { name: 1 }) {
    return await Category.find(filter)
      .populate("SubCategories")
      .sort(sort)
      .exec();
  }

  async findById(id) {
    return await Category.findById(id)
      .populate("SubCategories")
      .exec();
  }

  async findByName(name) {
    return await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    }).exec();
  }

  async create(categoryData) {
    return await Category.create(categoryData);
  }

  async updateById(id, updateData) {
    return await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteById(id) {
    return await Category.findByIdAndDelete(id).exec();
  }

  async searchByName(searchTerm) {
    return await Category.find({
      name: { $regex: searchTerm, $options: "i" },
    })
      .populate("SubCategories")
      .sort({ name: 1 })
      .exec();
  }
}

export default new CategoryRepository();
