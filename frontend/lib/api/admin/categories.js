/**
 * Admin Categories API
 */

import { get, post, put, del } from '../client';

export const categoriesAPI = {
  /**
   * Get all categories
   */
  getAll: (params = {}) => 
    get('/api/admin/categories', params),

  /**
   * Search categories
   */
  search: (query) => 
    get('/api/admin/categories/search', { q: query }),

  /**
   * Create category
   */
  create: (data) => 
    post('/api/admin/categories', data),

  /**
   * Update category
   */
  update: (id, data) => 
    put(`/api/admin/categories/${id}`, data),

  /**
   * Delete category
   */
  delete: (id) => 
    del(`/api/admin/categories/${id}`),

  /**
   * Get subcategories by category ID
   */
  getSubcategories: (categoryId) =>
    get(`/api/categories/${categoryId}/subcategories`),
};

export const subcategoriesAPI = {
  /**
   * Get all subcategories
   */
  getAll: (params = {}) => 
    get('/api/subcategories', params),

  /**
   * Create subcategory
   */
  create: (data) => 
    post('/api/subcategories', data),

  /**
   * Update subcategory
   */
  update: (id, data) => 
    put(`/api/subcategories/${id}`, data),

  /**
   * Delete subcategory
   */
  delete: (id) => 
    del(`/api/subcategories/${id}`),
};
