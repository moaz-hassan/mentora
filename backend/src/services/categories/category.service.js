import models from "../../models/index.js";

const { Category, SubCategory, Course } = models;


export const getAllCategories = async () => {
  const categories = await Category.findAll({
    include: [
      {
        model: SubCategory,
        attributes: ["id", "name", "createdAt", "updatedAt"],
      },
    ],
    order: [["name", "ASC"]],
  });

  // Add course count for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const coursesCount = await Course.count({
        where: { category: category.id },
      });
      
      return {
        ...category.toJSON(),
        coursesCount
      };
    })
  );

  return categoriesWithCounts;
};

export const getCategoryById = async (categoryId) => {
  const category = await Category.findByPk(categoryId, {
    include: [
      {
        model: SubCategory,
        attributes: ["id", "name", "createdAt", "updatedAt"],
      },
    ],
  });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
};


export const createCategory = async (categoryData) => {
  // Check for duplicate name (case-insensitive)
  const existingCategory = await Category.findOne({
    where: {
      name: categoryData.name,
    },
  });

  if (existingCategory) {
    const error = new Error("Category with this name already exists");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create(categoryData);
  return category;
};

/**
 * Update an existing category
 */
export const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  // Check for duplicate name if name is being updated
  if (updateData.name && updateData.name !== category.name) {
    const existingCategory = await Category.findOne({
      where: {
        name: updateData.name,
      },
    });

    if (existingCategory) {
      const error = new Error("Category with this name already exists");
      error.statusCode = 400;
      throw error;
    }
  }

  await category.update(updateData);
  return category;
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if category has associated courses
  const hasCourses = await checkCategoryHasCourses(categoryId);

  if (hasCourses) {
    const error = new Error(
      "Cannot delete category with associated courses. Please reassign or delete the courses first."
    );
    error.statusCode = 400;
    throw error;
  }

  await category.destroy();
  return { message: "Category deleted successfully" };
};

/**
 * Check if category has associated courses
 */
export const checkCategoryHasCourses = async (categoryId) => {
  const courseCount = await Course.count({
    where: { category_id: categoryId },
  });

  return courseCount > 0;
};

/**
 * Search categories by name
 */
export const searchCategories = async (searchTerm) => {
  const { Op } = await import("sequelize");
  
  const categories = await Category.findAll({
    where: {
      name: {
        [Op.like]: `%${searchTerm}%`
      }
    },
    include: [
      {
        model: SubCategory,
        attributes: ["id", "name"],
      },
    ],
    order: [["name", "ASC"]],
  });

  // Add course count for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const courseCount = await Course.count({
        where: { category_id: category.id },
      });
      
      return {
        ...category.toJSON(),
        courseCount
      };
    })
  );

  return categoriesWithCounts;
};
