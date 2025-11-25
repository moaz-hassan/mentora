/**
 * Admin Platform Analytics API
 */

import { get, post } from '../client';

export const platformAnalyticsAPI = {
  /**
   * Get enrollment analytics
   */
  getEnrollments: (params = {}) => 
    get('/api/admin/platform-analytics/enrollments', params),

  /**
   * Get payment analytics
   */
  getPayments: (params = {}) => 
    get('/api/admin/platform-analytics/payments', params),

  /**
   * Get user analytics
   */
  getUsers: (params = {}) => 
    get('/api/admin/platform-analytics/users', params),

  /**
   * Get course analytics
   */
  getCourses: (params = {}) => 
    get('/api/admin/platform-analytics/courses', params),

  /**
   * Generate custom report
   */
  generateCustomReport: (data) => 
    post('/api/admin/platform-analytics/custom', data),

  /**
   * Export analytics
   */
  export: (data) => 
    post('/api/admin/platform-analytics/export', data),

  /**
   * Schedule report
   */
  scheduleReport: (data) => 
    post('/api/admin/platform-analytics/schedule', data),
};
