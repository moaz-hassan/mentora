import models from "../../models/index.js";

const { Category, SubCategory, Course } = models;


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


export const getSubCategoriesByCategory = async (categoryId) => {
  
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


export const createSubCategory = async (subCategoryData) => {
  
  const category = await Category.findByPk(subCategoryData.category_id);

  if (!category) {
    const error = new Error("Parent category not found");
    error.statusCode = 404;
    throw error;
  }

  
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

  
  return await getSubCategoryById(subCategory.id);
};


export const updateSubCategory = async (subCategoryId, updateData) => {
  const subCategory = await SubCategory.findByPk(subCategoryId);

  if (!subCategory) {
    const error = new Error("Subcategory not found");
    error.statusCode = 404;
    throw error;
  }

  
  if (updateData.category_id && updateData.category_id !== subCategory.category_id) {
    const category = await Category.findByPk(updateData.category_id);

    if (!category) {
      const error = new Error("Parent category not found");
      error.statusCode = 404;
      throw error;
    }
  }

  
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

  
  return await getSubCategoryById(subCategory.id);
};


export const deleteSubCategory = async (subCategoryId) => {
  const subCategory = await SubCategory.findByPk(subCategoryId);

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

  await subCategory.destroy();
  return { message: "Subcategory deleted successfully" };
};


export const checkSubCategoryHasCourses = async (subCategoryId) => {
  const courseCount = await Course.count({
    where: { subcategory_id: subCategoryId },
  });

  return courseCount > 0;
};
