import models from "../models/index.model.js";

const { Category, SubCategory, Course } = models;

/**
 * Get all subcategories
 */
export const getAllSubCategories = async () => {
  const subCategories = await SubCategory.findAll({
    include: [
      {
        model: Category,
        attributes: ["id", "name"],
      },
    ],
    order: [["name", "ASC"]],
  });

  return subCategories;
};

/**
 * Get single subcategory by ID
 */
export const getSubCategoryById = async (subCategoryId) => {
  const subCategory = await SubCategory.findByPk(subCategoryId, {
    include: [
      {
        model: Category,
        attributes: ["id", "name"],
      },
    ],
  });

  if (!subCategory) {
    const error = new Error("Subcategory not found");
    error.statusCode = 404;
    throw error;
  }

  return subCategory;
};

/**
 * Get subcategories by category ID
 */
export const getSubCategoriesByCategory = async (categoryId) => {
  // Verify category exists
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const subCategories = await SubCategory.findAll({
    where: { category_id: categoryId },
    order: [["name", "ASC"]],
  });

  return subCategories;
};

/**
 * Create a new subcategory
 */
export const createSubCategory = async (subCategoryData) => {
  // Verify parent category exists
  const category = await Category.findByPk(subCategoryData.category_id);

  if (!category) {
    const error = new Error("Parent category not found");
    error.statusCode = 404;
    throw error;
  }

  // Check for duplicate name within the same category
  const existingSubCategory = await SubCategory.findOne({
    where: {
      name: subCategoryData.name,
      category_id: subCategoryData.category_id,
    },
  });

  if (existingSubCategory) {
    const error = new Error(
      "Subcategory with this name already exists in this category"
    );
    error.statusCode = 400;
    throw error;
  }

  const subCategory = await SubCategory.create(subCategoryData);

  // Fetch with category info
  return await getSubCategoryById(subCategory.id);
};

/**
 * Update an existing subcategory
 */
export const updateSubCategory = async (subCategoryId, updateData) => {
  const subCategory = await SubCategory.findByPk(subCategoryId);

  if (!subCategory) {
    const error = new Error("Subcategory not found");
    error.statusCode = 404;
    throw error;
  }

  // If category_id is being updated, verify new category exists
  if (updateData.category_id && updateData.category_id !== subCategory.category_id) {
    const category = await Category.findByPk(updateData.category_id);

    if (!category) {
      const error = new Error("Parent category not found");
      error.statusCode = 404;
      throw error;
    }
  }

  // Check for duplicate name if name or category is being updated
  if (updateData.name || updateData.category_id) {
    const nameToCheck = updateData.name || subCategory.name;
    const categoryToCheck = updateData.category_id || subCategory.category_id;

    const existingSubCategory = await SubCategory.findOne({
      where: {
        name: nameToCheck,
        category_id: categoryToCheck,
      },
    });

    if (existingSubCategory && existingSubCategory.id !== subCategoryId) {
      const error = new Error(
        "Subcategory with this name already exists in this category"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  await subCategory.update(updateData);

  // Fetch with category info
  return await getSubCategoryById(subCategory.id);
};

/**
 * Delete a subcategory
 */
export const deleteSubCategory = async (subCategoryId) => {
  const subCategory = await SubCategory.findByPk(subCategoryId);

  if (!subCategory) {
    const error = new Error("Subcategory not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if subcategory has associated courses
  const hasCourses = await checkSubCategoryHasCourses(subCategoryId);

  if (hasCourses) {
    const error = new Error(
      "Cannot delete subcategory with associated courses. Please reassign or delete the courses first."
    );
    error.statusCode = 400;
    throw error;
  }

  await subCategory.destroy();
  return { message: "Subcategory deleted successfully" };
};

/**
 * Check if subcategory has associated courses
 */
export const checkSubCategoryHasCourses = async (subCategoryId) => {
  const courseCount = await Course.count({
    where: { subcategory_id: subCategoryId },
  });

  return courseCount > 0;
};
