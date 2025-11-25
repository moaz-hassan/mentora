/**
 * Admin Financial API
 */

import { get, post } from '../client';

export const financialAPI = {
  /**
   * Get financial overview
   */
  getOverview: (params = {}) => 
    get('/api/admin/financial/overview', params),

  /**
   * Get revenue breakdown
   */
  getRevenue: (params = {}) => 
    get('/api/admin/financial/revenue', params),

  /**
   * Get payouts list
   */
  getPayouts: (params = {}) => 
    get('/api/admin/financial/payouts', params),

  /**
   * Process payout
   */
  processPayout: (id) => 
    post(`/api/admin/financial/payouts/${id}/process`),

  /**
   * Get transaction history
   */
  getTransactions: (params = {}) => 
    get('/api/admin/financial/transactions', params),

  /**
   * Export financial data
   */
  export: (data) => 
    post('/api/admin/financial/export', data),
};
