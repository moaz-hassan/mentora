/**
 * Admin Logs API
 */

import { get, post } from '../client';

export const logsAPI = {
  /**
   * Get audit logs
   */
  getAudit: (params = {}) => 
    get('/api/admin/logs/audit', params),

  /**
   * Get payment logs
   */
  getPayments: (params = {}) => 
    get('/api/admin/logs/payments', params),

  /**
   * Get enrollment logs
   */
  getEnrollments: (params = {}) => 
    get('/api/admin/logs/enrollments', params),

  /**
   * Get error logs
   */
  getErrors: (params = {}) => 
    get('/api/admin/logs/errors', params),

  /**
   * Get log analytics
   */
  getAnalytics: (params = {}) => 
    get('/api/admin/logs/analytics', params),

  /**
   * Search all logs
   */
  search: (params = {}) => 
    get('/api/admin/logs/search', params),

  /**
   * Export logs
   */
  export: (data) => 
    post('/api/admin/logs/export', data),
};
