import * as subCategoryService from "../../services/categories/subCategory.service.js";
import { invalidateCache } from "../../caching/cache.manager.js";


export const getAllSubCategories = async (req, res, next) => {
  try {
    const subCategories = await subCategoryService.getAllSubCategories();

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    next(error);
  }
};


export const getSubCategoryById = async (req, res, next) => {
  try {
    const subCategory = await subCategoryService.getSubCategoryById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};


export const getSubCategoriesByCategory = async (req, res, next) => {
  try {
    const subCategories =
      await subCategoryService.getSubCategoriesByCategory(req.params.id);

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    next(error);
  }
};


export const createSubCategory = async (req, res, next) => {
  try {
    const subCategory = await subCategoryService.createSubCategory(req.body);

    // Invalidate category-related caches (subcategories are included in category responses)
    await invalidateCache("*:/api/categories*");

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};


export const updateSubCategory = async (req, res, next) => {
  try {
    const subCategory = await subCategoryService.updateSubCategory(
      req.params.id,
      req.body
    );

    // Invalidate category-related caches
    await invalidateCache("*:/api/categories*");

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteSubCategory = async (req, res, next) => {
  try {
    const result = await subCategoryService.deleteSubCategory(req.params.id);

    // Invalidate category-related caches
    await invalidateCache("*:/api/categories*");

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

