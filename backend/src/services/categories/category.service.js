import categoryRepository from "../../repositories/categories/category.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";

export const getAllCategories = async () => {
  const categories = await categoryRepository.findAll();

  return await Promise.all(
    categories.map(async (category) => {
      const courseCount = await courseRepository.countByCategory(category.id);
      return {
        ...category.toJSON(),
        courseCount,
      };
    })
  );
};

export const getCategoryById = async (categoryId) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category.toJSON();
};

export const createCategory = async (categoryData) => {
  const existingCategory = await categoryRepository.findByName(categoryData.name);

  if (existingCategory) {
    const error = new Error("Category with this name already exists");
    error.statusCode = 400;
    throw error;
  }

  const category = await categoryRepository.create(categoryData);
  return category.toJSON();
};

export const updateCategory = async (categoryId, updateData) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.name && updateData.name.toLowerCase() !== category.name.toLowerCase()) {
    const existingCategory = await categoryRepository.findByName(updateData.name);
    if (existingCategory && existingCategory.id !== categoryId) {
      const error = new Error("Category with this name already exists");
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedCategory = await categoryRepository.updateById(categoryId, updateData);
  return updatedCategory.toJSON();
};

export const deleteCategory = async (categoryId) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const hasCourses = await checkCategoryHasCourses(categoryId);
  if (hasCourses) {
    const error = new Error(
      "Cannot delete category with associated courses. Please reassign or delete the courses first."
    );
    error.statusCode = 400;
    throw error;
  }

  await categoryRepository.deleteById(categoryId);
  return { message: "Category deleted successfully" };
};

export const checkCategoryHasCourses = async (categoryId) => {
  const count = await courseRepository.countByCategory(categoryId);
  return count > 0;
};

export const searchCategories = async (searchTerm) => {
  const categories = await categoryRepository.searchByName(searchTerm);

  return await Promise.all(
    categories.map(async (category) => {
      const courseCount = await courseRepository.countByCategory(category.id);
      return {
        ...category.toJSON(),
        courseCount,
      };
    })
  );
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  checkCategoryHasCourses,
  searchCategories,
};
