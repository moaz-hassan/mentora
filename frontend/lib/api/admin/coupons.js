/**
 * Admin Coupons API
 */

import { get, post, put, patch, del } from '../client';

export const couponsAPI = {
  /**
   * Get all coupons
   */
  getAll: (params = {}) => 
    get('/api/admin/coupons', params),

  /**
   * Search coupons
   */
  search: (params = {}) => 
    get('/api/admin/coupons/search', params),

  /**
   * Get coupon analytics
   */
  getAnalytics: () => 
    get('/api/admin/coupons/analytics'),

  /**
   * Get single coupon analytics
   */
  getCouponAnalytics: (id) => 
    get(`/api/admin/coupons/${id}/analytics`),

  /**
   * Create coupon
   */
  create: (data) => 
    post('/api/admin/coupons', data),

  /**
   * Update coupon
   */
  update: (id, data) => 
    put(`/api/admin/coupons/${id}`, data),

  /**
   * Update coupon status
   */
  updateStatus: (id, status) => 
    patch(`/api/admin/coupons/${id}/status`, { status }),

  /**
   * Delete coupon
   */
  delete: (id) => 
    del(`/api/admin/coupons/${id}`),

  /**
   * Deactivate expired coupons
   */
  deactivateExpired: () => 
    post('/api/admin/coupons/deactivate-expired'),
};
