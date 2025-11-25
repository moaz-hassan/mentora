/**
 * Admin Settings API
 */

import { get, post, put } from '../client';

export const settingsAPI = {
  /**
   * Get all settings
   */
  getAll: () => 
    get('/api/admin/settings'),

  /**
   * Get settings by category
   */
  getByCategory: (category) => 
    get(`/api/admin/settings/${category}`),

  /**
   * Create setting
   */
  create: (data) => 
    post('/api/admin/settings', data),

  /**
   * Update setting
   */
  update: (key, data) => 
    put(`/api/admin/settings/${key}`, data),

  /**
   * Bulk update settings
   */
  bulkUpdate: (settings) => 
    post('/api/admin/settings/bulk', { settings }),
};
