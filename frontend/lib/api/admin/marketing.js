/**
 * Admin Marketing API
 */

import { get, post, put, patch, del } from '../client';

export const marketingAPI = {
  /**
   * Get all campaigns
   */
  getCampaigns: (params = {}) => 
    get('/api/admin/marketing/campaigns', params),

  /**
   * Get campaign by ID
   */
  getCampaign: (id) => 
    get(`/api/admin/marketing/campaigns/${id}`),

  /**
   * Get campaign analytics
   */
  getCampaignAnalytics: (id) => 
    get(`/api/admin/marketing/campaigns/${id}/analytics`),

  /**
   * Create campaign
   */
  createCampaign: (data) => 
    post('/api/admin/marketing/campaigns', data),

  /**
   * Update campaign
   */
  updateCampaign: (id, data) => 
    put(`/api/admin/marketing/campaigns/${id}`, data),

  /**
   * Update campaign metrics
   */
  updateCampaignMetrics: (id, metrics) => 
    patch(`/api/admin/marketing/campaigns/${id}/metrics`, metrics),

  /**
   * Delete campaign
   */
  deleteCampaign: (id) => 
    del(`/api/admin/marketing/campaigns/${id}`),

  /**
   * Get featured courses
   */
  getFeaturedCourses: () => 
    get('/api/admin/marketing/featured-courses'),

  /**
   * Add featured course
   */
  addFeaturedCourse: (data) => 
    post('/api/admin/marketing/featured-courses', data),

  /**
   * Update featured course
   */
  updateFeaturedCourse: (id, data) => 
    put(`/api/admin/marketing/featured-courses/${id}`, data),

  /**
   * Remove featured course
   */
  removeFeaturedCourse: (id) => 
    del(`/api/admin/marketing/featured-courses/${id}`),
};
