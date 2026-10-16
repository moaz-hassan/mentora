import subCategoryRepository from "../../repositories/categories/subCategory.repository.js";
import categoryRepository from "../../repositories/categories/category.repository.js";
import courseRepository from "../../repositories/courses/course.repository.js";

export const getAllSubCategories = async () => {
  const subCategories = await subCategoryRepository.findAll();
  return subCategories.map((s) => s.toJSON());
};

export const getSubCategoryById = async (subCategoryId) => {
  const subCategory = await subCategoryRepository.findById(subCategoryId);

  if (!subCategory) {
    const error = new Error("Subcategory not found");
    error.statusCode = 404;
    throw error;
  }

  return subCategory.toJSON();
};

export const getSubCategoriesByCategory = async (categoryId) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const subCategories = await subCategoryRepository.findByCategoryId(categoryId);
  return subCategories.map((s) => s.toJSON());
};

export const createSubCategory = async (subCategoryData) => {
  const category = await categoryRepository.findById(subCategoryData.category_id);

  if (!category) {
    const error = new Error("Parent category not found");
    error.statusCode = 404;
    throw error;
  }

  const existingSubCategory = await subCategoryRepository.findByNameAndCategory(
    subCategoryData.name,
    subCategoryData.category_id
  );

  if (existingSubCategory) {
    const error = new Error(
      "Subcategory with this name already exists in this category"
    );
    error.statusCode = 400;
    throw error;
  }

  const subCategory = await subCategoryRepository.create(subCategoryData);
  return await getSubCategoryById(subCategory.id);
};

export const updateSubCategory = async (subCategoryId, updateData) => {
  const subCategory = await subCategoryRepository.findById(subCategoryId);

  if (!subCategory) {
    const error = new Error("Subcategory not found");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.category_id && updateData.category_id !== subCategory.category_id) {
    const category = await categoryRepository.findById(updateData.category_id);
    if (!category) {
      const error = new Error("Parent category not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (updateData.name || updateData.category_id) {
    const nameToCheck = updateData.name || subCategory.name;
    const categoryToCheck = updateData.category_id || subCategory.category_id;

    const existingSubCategory = await subCategoryRepository.findByNameAndCategory(
      nameToCheck,
      categoryToCheck
    );

    if (existingSubCategory && existingSubCategory.id !== subCategoryId) {
      const error = new Error(
        "Subcategory with this name already exists in this category"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  await subCategoryRepository.updateById(subCategoryId, updateData);
  return await getSubCategoryById(subCategoryId);
};

export const deleteSubCategory = async (subCategoryId) => {
  const subCategory = await subCategoryRepository.findById(subCategoryId);

  if (!subCategory) {
    const error = new Error("Subcategory not found");
    error.statusCode = 404;
    throw error;
  }

  const hasCourses = await checkSubCategoryHasCourses(subCategoryId);
  if (hasCourses) {
    const error = new Error(
      "Cannot delete subcategory with associated courses. Please reassign or delete the courses first."
    );
    error.statusCode = 400;
    throw error;
  }

  await subCategoryRepository.deleteById(subCategoryId);
  return { message: "Subcategory deleted successfully" };
};

export const checkSubCategoryHasCourses = async (subCategoryId) => {
  const count = await courseRepository.countBySubCategory(subCategoryId);
  return count > 0;
};

export default {
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  checkSubCategoryHasCourses,
};
