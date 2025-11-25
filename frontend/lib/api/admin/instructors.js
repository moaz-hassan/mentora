/**
 * Admin Instructors API
 */

import { get, patch } from '../client';

export const instructorsAPI = {
  /**
   * Get all instructors
   */
  getAll: (params = {}) => 
    get('/api/admin/instructors', params),

  /**
   * Get instructor by ID
   */
  getById: (id) => 
    get(`/api/admin/instructors/${id}`),

  /**
   * Get instructor analytics
   */
  getAnalytics: (id) => 
    get(`/api/admin/instructors/${id}/analytics`),

  /**
   * Update instructor status
   */
  updateStatus: (id, status) => 
    patch(`/api/admin/instructors/${id}/status`, { status }),

  /**
   * Get instructor payouts
   */
  getPayouts: (id, params = {}) => 
    get(`/api/admin/instructors/${id}/payouts`, params),
};
