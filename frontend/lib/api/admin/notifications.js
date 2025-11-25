/**
 * Admin Notifications API
 */

import { get, post, del } from '../client';

export const notificationsAPI = {
  /**
   * Broadcast notification
   */
  broadcast: (data) => 
    post('/api/admin/notifications/broadcast', data),

  /**
   * Get notification history
   */
  getHistory: (params = {}) => 
    get('/api/admin/notifications/history', params),

  /**
   * Get delivery statistics
   */
  getStatistics: (params = {}) => 
    get('/api/admin/notifications/statistics', params),

  /**
   * Get scheduled notifications
   */
  getScheduled: () => 
    get('/api/admin/notifications/scheduled'),

  /**
   * Get notification metrics
   */
  getMetrics: (id) => 
    get(`/api/admin/notifications/${id}/metrics`),

  /**
   * Send scheduled notification
   */
  sendScheduled: (id) => 
    post(`/api/admin/notifications/${id}/send`),

  /**
   * Cancel scheduled notification
   */
  cancelScheduled: (id) => 
    del(`/api/admin/notifications/${id}/cancel`),
};
