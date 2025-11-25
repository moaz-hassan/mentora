/**
 * Admin Analytics API
 */

import { get, post } from '../client';

export const analyticsAPI = {
  /**
   * Get platform overview
   */
  getOverview: (params = {}) => 
    get('/api/admin/analytics/overview', params),

  /**
   * Get revenue analytics
   */
  getRevenue: (params = {}) => 
    get('/api/admin/analytics/revenue', params),

  /**
   * Get user growth analytics
   */
  getUsers: (params = {}) => 
    get('/api/admin/analytics/users', params),

  /**
   * Get enrollment analytics
   */
  getEnrollments: (params = {}) => 
    get('/api/admin/analytics/enrollments', params),

  /**
   * Get course performance analytics
   */
  getCourses: () => 
    get('/api/admin/analytics/courses'),

  /**
   * Export analytics data
   */
  exportData: (data) => 
    post('/api/admin/analytics/export', data),
};
